"""Demand forecasting training, evaluation, and recursive prediction."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from .config import DEMAND_MODEL_PATH, DEMAND_MODEL_VERSION
from .features import (
    ALL_BASE_FEATURES,
    feature_frame,
    encode_features,
)

DEFAULT_TRAIN_PARAMS = {
    "n_estimators": 300,
    "max_depth": 10,
    "min_samples_leaf": 3,
    "random_state": 42,
    "n_jobs": -1,
}


def chronological_split(featured: pd.DataFrame, test_months: int = 6):
    if test_months < 1:
        raise ValueError("test_months must be positive")
    test_start = featured["month"].max() - pd.DateOffset(months=test_months - 1)
    train = featured[featured["month"] < test_start].copy()
    test = featured[featured["month"] >= test_start].copy()
    if train.empty or test.empty:
        raise ValueError("Chronological split produced an empty partition")
    return train, test


def train_demand_model(
    history: pd.DataFrame,
    test_months: int = 6,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    params = {**DEFAULT_TRAIN_PARAMS, **(params or {})}
    featured = feature_frame(history)
    train, test = chronological_split(featured, test_months=test_months)

    X_train, feature_columns = encode_features(train)
    X_test, _ = encode_features(test, feature_columns)
    y_train = train["demand_quintals"].to_numpy(dtype=float)
    y_test = test["demand_quintals"].to_numpy(dtype=float)

    model = RandomForestRegressor(**params)
    model.fit(X_train, y_train)

    rf_pred = model.predict(X_test)
    baseline_pred = test["lag_12"].to_numpy(dtype=float)

    metrics = {
        "seasonal_naive": _metrics(y_test, baseline_pred),
        "random_forest": _metrics(y_test, rf_pred),
    }

    artifact = {
        "model": model,
        "feature_columns": feature_columns,
        "model_version": DEMAND_MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "test_months": test_months,
        "metrics": metrics,
        "training_period": {
            "start": train["month"].min().date().isoformat(),
            "end": train["month"].max().date().isoformat(),
            "rows": int(len(train)),
        },
        "test_period": {
            "start": test["month"].min().date().isoformat(),
            "end": test["month"].max().date().isoformat(),
            "rows": int(len(test)),
        },
        "params": params,
    }
    return artifact


def _metrics(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    mae = float(mean_absolute_error(actual, predicted))
    rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
    denom = np.where(actual == 0, np.nan, actual)
    mape = float(np.nanmean(np.abs((actual - predicted) / denom)) * 100)
    return {"mae": mae, "rmse": rmse, "mape": mape}


def save_artifact(artifact: dict[str, Any], path=None) -> None:
    path = path or DEMAND_MODEL_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, path)


def load_artifact(path=None) -> dict[str, Any]:
    path = path or DEMAND_MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Demand model artifact not found: {path}")
    artifact = joblib.load(path)
    required = {"model", "feature_columns", "model_version"}
    if not required.issubset(artifact):
        raise ValueError("Demand model artifact is incomplete")
    return artifact


def forecast_demand(history: pd.DataFrame, horizon: int, artifact: dict[str, Any]) -> pd.DataFrame:
    if horizon < 1:
        raise ValueError("horizon must be positive")

    history = prepare_history_for_forecast(history)
    model = artifact["model"]
    feature_columns = artifact["feature_columns"]
    version = artifact["model_version"]

    groups = sorted(history.groupby(["district_id", "product_id"]).groups.keys())
    if not groups:
        raise ValueError("No district/product groups in history")

    population_map = (
        history.sort_values("month")
        .groupby(["district_id", "product_id"])["population_estimate"]
        .last()
        .to_dict()
    )

    demand_maps: dict[tuple[str, str], dict[pd.Timestamp, float]] = {}
    for key in groups:
        group_history = history[
            (history["district_id"] == key[0]) & (history["product_id"] == key[1])
        ].sort_values("month")
        demand_maps[key] = {
            pd.Timestamp(row.month): float(row.demand_quintals)
            for row in group_history.itertuples(index=False)
        }

    last_month = pd.Timestamp(history["month"].max())
    records: list[dict[str, Any]] = []

    for step in range(1, horizon + 1):
        target_month = last_month + pd.DateOffset(months=step)
        rows = []
        group_order = []
        for key in groups:
            district_id, product_id = key
            demand_map = demand_maps[key]
            lag_1_month = target_month - pd.DateOffset(months=1)
            lag_3_month = target_month - pd.DateOffset(months=3)
            lag_12_month = target_month - pd.DateOffset(months=12)

            lag_1 = demand_map.get(lag_1_month)
            lag_3 = demand_map.get(lag_3_month)
            lag_12 = demand_map.get(lag_12_month)
            rolling_values = [
                demand_map.get(target_month - pd.DateOffset(months=offset))
                for offset in (1, 2, 3)
            ]

            if lag_1 is None or lag_3 is None or lag_12 is None or any(v is None for v in rolling_values):
                raise ValueError(
                    f"Insufficient history to forecast {district_id}/{product_id} at {target_month.date()}"
                )

            month_number = target_month.month
            rows.append(
                {
                    "district_id": district_id,
                    "product_id": product_id,
                    "population_estimate": float(population_map[key]),
                    "festival_season_flag": 1 if month_number in (10, 11) else 0,
                    "shortage_event_flag": 0,
                    "month_sin": math.sin(2 * math.pi * month_number / 12),
                    "month_cos": math.cos(2 * math.pi * month_number / 12),
                    "lag_1": float(lag_1),
                    "lag_3": float(lag_3),
                    "lag_12": float(lag_12),
                    "rolling_mean_3": float(np.mean(rolling_values)),
                }
            )
            group_order.append(key)

        encoded, _ = encode_features(pd.DataFrame(rows), feature_columns)
        predictions = model.predict(encoded)

        for key, prediction in zip(group_order, predictions):
            demand_maps[key][target_month] = float(prediction)
            district_id, product_id = key
            records.append(
                {
                    "forecast_month": target_month.date().isoformat(),
                    "district_id": district_id,
                    "product_id": product_id,
                    "predicted_demand_quintals": float(prediction),
                    "model_version": version,
                }
            )

    return pd.DataFrame(records)


def prepare_history_for_forecast(history: pd.DataFrame) -> pd.DataFrame:
    history = history.copy()
    history["month"] = pd.to_datetime(history["month"])
    if "demand_quintals" not in history.columns:
        raise ValueError("history must contain demand_quintals")
    return history.sort_values(["district_id", "product_id", "month"]).reset_index(drop=True)

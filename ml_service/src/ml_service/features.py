"""Feature engineering for demand forecasting."""

from __future__ import annotations

import math
from typing import Iterable

import numpy as np
import pandas as pd

BASE_NUMERIC_FEATURES = [
    "population_estimate",
    "festival_season_flag",
    "shortage_event_flag",
    "month_sin",
    "month_cos",
    "lag_1",
    "lag_3",
    "lag_12",
    "rolling_mean_3",
]
CATEGORICAL_FEATURES = ["district_id", "product_id"]
ALL_BASE_FEATURES = CATEGORICAL_FEATURES + BASE_NUMERIC_FEATURES

REQUIRED_HISTORY_COLUMNS = {
    "month",
    "district_id",
    "product_id",
    "demand_quintals",
    "population_estimate",
    "festival_season_flag",
    "shortage_event_flag",
}


def validate_history(df: pd.DataFrame) -> None:
    missing = REQUIRED_HISTORY_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required history columns: {sorted(missing)}")


def prepare_history(df: pd.DataFrame) -> pd.DataFrame:
    """Sort and validate monthly demand history."""
    validate_history(df)
    out = df.copy()
    out["month"] = pd.to_datetime(out["month"])
    out = out.sort_values(["district_id", "product_id", "month"]).reset_index(drop=True)
    if out[["district_id", "product_id", "month"]].duplicated().any():
        raise ValueError("Duplicate district/product/month rows in history")
    return out


def add_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add lag and rolling features without temporal leakage."""
    out = prepare_history(df)
    grouped = out.groupby(["district_id", "product_id"], sort=False)["demand_quintals"]

    out["lag_1"] = grouped.shift(1)
    out["lag_3"] = grouped.shift(3)
    out["lag_12"] = grouped.shift(12)
    out["rolling_mean_3"] = (
        out.groupby(["district_id", "product_id"], sort=False)["demand_quintals"]
        .transform(lambda series: series.shift(1).rolling(3, min_periods=3).mean())
    )

    month_number = out["month"].dt.month
    out["month_number"] = month_number
    out["month_sin"] = np.sin(2 * math.pi * month_number / 12)
    out["month_cos"] = np.cos(2 * math.pi * month_number / 12)
    return out


def feature_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Return rows that have complete lag features."""
    featured = add_lag_features(df)
    required = ["lag_1", "lag_3", "lag_12", "rolling_mean_3"]
    return featured.dropna(subset=required).reset_index(drop=True)


def encode_features(df: pd.DataFrame, feature_columns: Iterable[str] | None = None) -> tuple[pd.DataFrame, list[str]]:
    """Encode categorical demand features and align to a stored column list."""
    base = df[CATEGORICAL_FEATURES + BASE_NUMERIC_FEATURES].copy()
    encoded = pd.get_dummies(base, columns=CATEGORICAL_FEATURES, dtype=int)
    columns = list(feature_columns) if feature_columns is not None else list(encoded.columns)
    encoded = encoded.reindex(columns=columns, fill_value=0)
    return encoded, columns

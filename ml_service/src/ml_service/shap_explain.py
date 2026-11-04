"""SHAP explanations for demand forecasts."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import shap

from .features import encode_features


def explain_demand(
    instance: pd.DataFrame,
    artifact: dict[str, Any],
    top_n: int = 15,
) -> list[dict[str, Any]]:
    if top_n < 1:
        raise ValueError("top_n must be positive")

    model = artifact["model"]
    feature_columns = artifact["feature_columns"]
    version = artifact["model_version"]

    X, _ = encode_features(instance, feature_columns)
    explainer = shap.TreeExplainer(model)
    explanation = explainer(X)

    values = np.asarray(explanation.values)
    base_values = np.asarray(explanation.base_values)

    results: list[dict[str, Any]] = []
    for row_index in range(len(X)):
        row_values = values[row_index]
        base_value = float(np.atleast_1d(base_values)[row_index] if np.ndim(base_values) else base_values)
        contributions = sorted(
            (
                {
                    "feature": feature,
                    "contribution": float(value),
                    "direction": "increases" if value >= 0 else "decreases",
                }
                for feature, value in zip(feature_columns, row_values)
            ),
            key=lambda item: abs(item["contribution"]),
            reverse=True,
        )[:top_n]
        results.append(
            {
                "model_version": version,
                "base_value": base_value,
                "prediction": float(model.predict(X.iloc[[row_index]])[0]),
                "contributions": contributions,
            }
        )
    return results

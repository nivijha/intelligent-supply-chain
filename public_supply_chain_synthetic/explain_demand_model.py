
import joblib
import pandas as pd
import shap
import matplotlib.pyplot as plt

from pathlib import Path

# Paths
OUTPUT_DIR = Path("outputs")
MODEL_PATH = OUTPUT_DIR / "demand_model.joblib"
PREDICTIONS_PATH = OUTPUT_DIR / "demand_predictions.csv"

# Load the saved model
saved = joblib.load(MODEL_PATH)
model = saved["model"]
feature_columns = saved["feature_columns"]

# Load held-out prediction records
predictions = pd.read_csv(PREDICTIONS_PATH)
predictions["month"] = pd.to_datetime(predictions["month"])

# Reconstruct the feature rows using the original dataset.
data = pd.read_csv("data/core/monthly_demand_history.csv")
data["month"] = pd.to_datetime(data["month"])

group_cols = ["district_id", "product_id"]
data = data.sort_values(group_cols + ["month"]).copy()

grouped = data.groupby(group_cols)["demand_quintals"]

data["lag_1"] = grouped.shift(1)
data["lag_3"] = grouped.shift(3)
data["lag_12"] = grouped.shift(12)

data["rolling_mean_3"] = (
    data.groupby(group_cols)["demand_quintals"]
    .transform(lambda s: s.shift(1).rolling(3).mean())
)

data["month_number"] = data["month"].dt.month
import numpy as np

data["month_sin"] = np.sin(2 * np.pi * data["month_number"] / 12)
data["month_cos"] = np.cos(2 * np.pi * data["month_number"] / 12)

data = data.dropna(
    subset=["lag_1", "lag_3", "lag_12", "rolling_mean_3"]
).copy()

# Select the same test period used during training.
test_start = data["month"].max() - pd.DateOffset(months=5)
test = data[data["month"] >= test_start].copy()

feature_cols = [
    "district_id",
    "product_id",
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

X_test = pd.get_dummies(
    test[feature_cols],
    columns=["district_id", "product_id"],
    dtype=int
)

X_test = X_test.reindex(
    columns=feature_columns,
    fill_value=0
)

# Use a small sample to keep SHAP calculation manageable.
X_sample = X_test.sample(
    n=min(100, len(X_test)),
    random_state=42
)

# Explain Random Forest predictions.
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_sample)

# Save global feature importance plot.
shap.plots.bar(shap_values, max_display=15, show=False)
plt.tight_layout()
plt.savefig(
    OUTPUT_DIR / "shap_feature_importance.png",
    dpi=150,
    bbox_inches="tight"
)
plt.close()

# Save a summary plot showing direction and magnitude.
shap.plots.beeswarm(shap_values, max_display=15, show=False)
plt.tight_layout()
plt.savefig(
    OUTPUT_DIR / "shap_summary.png",
    dpi=150,
    bbox_inches="tight"
)
plt.close()

print("SHAP analysis completed.")
print("Saved:", OUTPUT_DIR / "shap_feature_importance.png")
print("Saved:", OUTPUT_DIR / "shap_summary.png")

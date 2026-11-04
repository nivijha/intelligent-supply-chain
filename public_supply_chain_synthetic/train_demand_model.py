import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# --------------------------------------------------
# 1. Load and prepare data
# --------------------------------------------------
DATA_PATH = Path("data/core/monthly_demand_history.csv")
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)
df["month"] = pd.to_datetime(df["month"])

group_cols = ["district_id", "product_id"]
df = df.sort_values(group_cols + ["month"]).copy()

# Historical demand features, calculated separately
# for every district-product combination.
grouped = df.groupby(group_cols)["demand_quintals"]

df["lag_1"] = grouped.shift(1)
df["lag_3"] = grouped.shift(3)
df["lag_12"] = grouped.shift(12)

df["rolling_mean_3"] = (
    df.groupby(group_cols)["demand_quintals"]
    .transform(lambda s: s.shift(1).rolling(3).mean())
)

# Calendar features
df["month_number"] = df["month"].dt.month
df["month_sin"] = np.sin(2 * np.pi * df["month_number"] / 12)
df["month_cos"] = np.cos(2 * np.pi * df["month_number"] / 12)

# Remove rows without enough historical information
df = df.dropna(
    subset=["lag_1", "lag_3", "lag_12", "rolling_mean_3"]
).copy()

# --------------------------------------------------
# 2. Split chronologically: last 6 months for testing
# --------------------------------------------------
test_start = df["month"].max() - pd.DateOffset(months=5)

train = df[df["month"] < test_start].copy()
test = df[df["month"] >= test_start].copy()

print("Training period:",
      train["month"].min().date(), "to",
      train["month"].max().date())

print("Testing period:",
      test["month"].min().date(), "to",
      test["month"].max().date())

print("Training rows:", len(train))
print("Testing rows:", len(test))

# --------------------------------------------------
# 3. Baseline: same month last year
# --------------------------------------------------
y_test = test["demand_quintals"].to_numpy()
baseline_pred = test["lag_12"].to_numpy()

# --------------------------------------------------
# 4. Train Random Forest
# --------------------------------------------------
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

X_train = pd.get_dummies(
    train[feature_cols],
    columns=["district_id", "product_id"],
    dtype=int
)

X_test = pd.get_dummies(
    test[feature_cols],
    columns=["district_id", "product_id"],
    dtype=int
)

# Ensure train and test have identical feature columns
X_test = X_test.reindex(columns=X_train.columns, fill_value=0)

y_train = train["demand_quintals"]

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=10,
    min_samples_leaf=3,
    random_state=42,
    n_jobs=-1
)

# Train the model
model.fit(X_train, y_train)

# Save the trained model and its feature columns
joblib.dump(
    {
        "model": model,
        "feature_columns": X_train.columns.tolist()
    },
    OUTPUT_DIR / "demand_model.joblib"
)

print("Trained model saved successfully!")

# Generate predictions
rf_pred = model.predict(X_test)

# --------------------------------------------------
# 5. Evaluation
# --------------------------------------------------
def evaluate(name, actual, predicted):
    mae = mean_absolute_error(actual, predicted)
    rmse = np.sqrt(mean_squared_error(actual, predicted))

    print(f"\n{name}")
    print(f"MAE:  {mae:.2f} quintals")
    print(f"RMSE: {rmse:.2f} quintals")

    return {"Model": name, "MAE": mae, "RMSE": rmse}

results = [
    evaluate("Seasonal-naive baseline", y_test, baseline_pred),
    evaluate("Random Forest", y_test, rf_pred),
]

results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_DIR / "model_metrics.csv", index=False)

# Save predictions for inspection
predictions = test[
    ["month", "district_id", "product_id", "demand_quintals"]
].copy()

predictions = predictions.rename(
    columns={"demand_quintals": "actual_demand"}
)

predictions["baseline_prediction"] = baseline_pred
predictions["random_forest_prediction"] = rf_pred

predictions.to_csv(
    OUTPUT_DIR / "demand_predictions.csv",
    index=False
)

# Feature importance
importance = pd.DataFrame({
    "feature": X_train.columns,
    "importance": model.feature_importances_
}).sort_values("importance", ascending=False)

importance.to_csv(
    OUTPUT_DIR / "feature_importance.csv",
    index=False
)

# --------------------------------------------------
# 6. Plot actual vs predicted demand
# --------------------------------------------------
plot_data = predictions.sort_values("month")

# Aggregate across all district-product combinations
monthly_plot = plot_data.groupby("month").agg(
    actual=("actual_demand", "mean"),
    baseline=("baseline_prediction", "mean"),
    random_forest=("random_forest_prediction", "mean")
)

plt.figure(figsize=(11, 6))
plt.plot(monthly_plot.index, monthly_plot["actual"],
         marker="o", label="Actual demand")
plt.plot(monthly_plot.index, monthly_plot["baseline"],
         marker="o", label="Seasonal baseline")
plt.plot(monthly_plot.index, monthly_plot["random_forest"],
         marker="o", label="Random Forest")

plt.title("Monthly Demand Forecast: Test Period")
plt.xlabel("Month")
plt.ylabel("Average demand (quintals)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "demand_forecast.png", dpi=150)
plt.show()

print("\nFiles saved in:", OUTPUT_DIR.resolve())
print("\n", results_df)
print("\nTop 10 features:")
print(importance.head(10).to_string(index=False))

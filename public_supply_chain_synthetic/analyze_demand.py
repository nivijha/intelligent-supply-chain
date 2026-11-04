
import pandas as pd

# Load demand data
file_path = "data/core/monthly_demand_history.csv"
df = pd.read_csv(file_path)

# Convert month to datetime
df["month"] = pd.to_datetime(df["month"])

print("\n========== BASIC INFORMATION ==========")
print("Total records:", len(df))
print("Date range:", df["month"].min(), "to", df["month"].max())
print("Unique districts:", df["district_id"].nunique())
print("Unique products:", df["product_id"].nunique())

print("\n========== OBSERVATIONS PER DISTRICT-PRODUCT ==========")
counts = df.groupby(
    ["district_id", "product_id"]
).size()

print(counts.describe())
print("Minimum observations:", counts.min())
print("Maximum observations:", counts.max())

print("\n========== DEMAND STATISTICS ==========")
print(df["demand_quintals"].describe())

print("\n========== DEMAND BY PRODUCT ==========")
print(
    df.groupby("product_id")["demand_quintals"]
    .agg(["count", "mean", "min", "max"])
    .round(2)
)

print("\n========== MONTHLY AVERAGE DEMAND ==========")
monthly = (
    df.groupby("month")["demand_quintals"]
    .mean()
    .sort_index()
)

print(monthly.head(12))

print("\n========== FEATURE CORRELATIONS ==========")
print(
    df[[
        "demand_quintals",
        "population_estimate",
        "festival_season_flag",
        "shortage_event_flag"
    ]].corr().round(3)
)

print("\nAnalysis complete.")

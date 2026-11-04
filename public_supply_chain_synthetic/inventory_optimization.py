
import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# 1. File paths
# --------------------------------------------------
DATA_DIR = Path("data/core")
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

demand = pd.read_csv(DATA_DIR / "monthly_demand_history.csv")
inventory = pd.read_csv(DATA_DIR / "inventory_snapshot.csv")

demand["month"] = pd.to_datetime(demand["month"])

# --------------------------------------------------
# 2. Estimate average monthly demand per district
#    and product, then convert to daily demand.
# --------------------------------------------------
district_product_demand = (
    demand.groupby(["district_id", "product_id"])["demand_quintals"]
    .mean()
    .reset_index(name="average_monthly_demand")
)

# Approximate daily demand using 30 days per month
district_product_demand["average_daily_demand"] = (
    district_product_demand["average_monthly_demand"] / 30
)

# The inventory data identifies warehouses, not districts.
# Therefore, calculate a product-level average across districts.
product_demand = (
    district_product_demand.groupby("product_id")["average_daily_demand"]
    .mean()
    .reset_index()
)

# --------------------------------------------------
# 3. Join demand estimates with warehouse inventory
# --------------------------------------------------
result = inventory.merge(
    product_demand,
    on="product_id",
    how="left",
    validate="many_to_one"
)

if result["average_daily_demand"].isna().any():
    raise ValueError("Some inventory products have no matching demand data.")

# --------------------------------------------------
# 4. Calculate stock and reorder recommendations
# --------------------------------------------------
result["available_stock_quintals"] = (
    result["on_hand_quintals"] - result["reserved_quintals"]
).clip(lower=0)

result["lead_time_demand_quintals"] = (
    result["average_daily_demand"] *
    result["reorder_lead_time_days"]
)

# Reorder point = expected lead-time demand + safety stock
result["reorder_point_quintals"] = (
    result["lead_time_demand_quintals"] +
    result["safety_stock_quintals"]
)

result["stock_status"] = np.where(
    result["available_stock_quintals"] <=
    result["reorder_point_quintals"],
    "REORDER",
    "SUFFICIENT"
)

# Initial policy: replenish up to the reorder point.
# This is a simple demonstration policy, not a validated
# economic order quantity or capacity-constrained plan.
result["recommended_order_quintals"] = np.where(
    result["stock_status"] == "REORDER",
    np.ceil(
        result["reorder_point_quintals"] -
        result["available_stock_quintals"]
    ),
    0
).astype(int)

result["estimated_order_cost_inr"] = (
    result["recommended_order_quintals"] *
    result["unit_procurement_cost_inr"]
)

# --------------------------------------------------
# 5. Save results
# --------------------------------------------------
columns_to_save = [
    "snapshot_date",
    "warehouse_id",
    "product_id",
    "on_hand_quintals",
    "reserved_quintals",
    "available_stock_quintals",
    "average_daily_demand",
    "reorder_lead_time_days",
    "lead_time_demand_quintals",
    "safety_stock_quintals",
    "reorder_point_quintals",
    "stock_status",
    "recommended_order_quintals",
    "unit_procurement_cost_inr",
    "estimated_order_cost_inr",
    "expiry_risk_score",
]

output_file = OUTPUT_DIR / "inventory_recommendations.csv"
result[columns_to_save].to_csv(output_file, index=False)

# --------------------------------------------------
# 6. Display summary
# --------------------------------------------------
print("\n========== INVENTORY OPTIMIZATION ==========")
print("Warehouse-product combinations:", len(result))
print("\nStock status:")
print(result["stock_status"].value_counts())

print("\nTotal recommended order quantity:",
      result["recommended_order_quintals"].sum(),
      "quintals")

print("Estimated total order cost: INR",
      round(result["estimated_order_cost_inr"].sum(), 2))

print("\nRecommendations:")
print(
    result.loc[
        result["stock_status"] == "REORDER",
        [
            "warehouse_id",
            "product_id",
            "available_stock_quintals",
            "reorder_point_quintals",
            "recommended_order_quintals",
            "estimated_order_cost_inr",
        ]
    ].to_string(index=False)
)

print("\nSaved to:", output_file.resolve())


import pandas as pd
import numpy as np
from pathlib import Path

# --------------------------------------------------
# 1. Load datasets
# --------------------------------------------------
DATA_DIR = Path("data")
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)

routes = pd.read_csv(
    DATA_DIR / "logistics" / "route_allocation_candidates.csv"
)

vehicles = pd.read_csv(
    DATA_DIR / "logistics" / "vehicle_fleet.csv"
)

inventory = pd.read_csv(
    DATA_DIR / "core" / "inventory_snapshot.csv"
)

# --------------------------------------------------
# 2. Attach actual fleet and inventory information
# --------------------------------------------------
routes = routes.merge(
    vehicles[[
        "vehicle_id",
        "capacity_quintals",
        "availability_flag"
    ]].rename(columns={
        "capacity_quintals": "fleet_capacity_quintals",
        "availability_flag": "vehicle_available"
    }),
    on="vehicle_id",
    how="left",
    validate="many_to_one"
)

# Calculate available inventory after reserved stock
inventory["current_available_stock"] = (
    inventory["on_hand_quintals"]
    - inventory["reserved_quintals"]
).clip(lower=0)

routes = routes.merge(
    inventory[[
        "warehouse_id",
        "product_id",
        "current_available_stock"
    ]],
    on=["warehouse_id", "product_id"],
    how="left",
    validate="many_to_one"
)

# --------------------------------------------------
# 3. Identify feasible candidates
# --------------------------------------------------
routes["vehicle_capacity_ok"] = (
    routes["quantity_quintals"]
    <= routes["fleet_capacity_quintals"]
)

routes["stock_available_ok"] = (
    routes["quantity_quintals"]
    <= routes["current_available_stock"]
)

routes["route_capacity_ok"] = (
    routes["capacity_violation_quintals"] <= 0
)

routes["vehicle_available_ok"] = (
    routes["vehicle_available"] == 1
)

routes["feasible"] = (
    routes["vehicle_capacity_ok"]
    & routes["stock_available_ok"]
    & routes["route_capacity_ok"]
    & routes["vehicle_available_ok"]
    & routes["current_available_stock"].notna()
)

# --------------------------------------------------
# 4. Select the lowest-cost feasible candidate
#    for each shipment
# --------------------------------------------------
feasible = routes[routes["feasible"]].copy()

feasible = feasible.sort_values(
    ["shipment_id", "estimated_cost_inr_simulated",
     "estimated_time_hours_simulated"]
)

recommendations = feasible.drop_duplicates(
    subset=["shipment_id"],
    keep="first"
).copy()

recommendations["recommendation_status"] = "FEASIBLE_LOWEST_COST"

# Identify shipments with no feasible candidate
all_shipments = routes["shipment_id"].drop_duplicates()

selected_shipments = recommendations["shipment_id"]

unserved_ids = all_shipments[
    ~all_shipments.isin(selected_shipments)
]

unserved = routes[
    routes["shipment_id"].isin(unserved_ids)
].copy()

# Keep the lowest-stock-shortfall candidate for diagnosis,
# but do NOT present it as a feasible recommendation.
unserved = unserved.sort_values(
    [
        "shipment_id",
        "stock_shortfall_quintals",
        "capacity_violation_quintals",
        "estimated_cost_inr_simulated"
    ]
)

unserved = unserved.drop_duplicates(
    subset=["shipment_id"],
    keep="first"
).copy()

unserved["recommendation_status"] = "NO_FEASIBLE_CANDIDATE"

# --------------------------------------------------
# 5. Save outputs
# --------------------------------------------------
output_columns = [
    "shipment_id",
    "candidate_id",
    "warehouse_id",
    "district_id",
    "product_id",
    "quantity_quintals",
    "vehicle_id",
    "distance_km_simulated",
    "estimated_time_hours_simulated",
    "estimated_cost_inr_simulated",
    "current_available_stock",
    "fleet_capacity_quintals",
    "stock_shortfall_quintals",
    "capacity_violation_quintals",
    "recommendation_status"
]

recommendations[output_columns].to_csv(
    OUTPUT_DIR / "route_recommendations.csv",
    index=False
)

unserved[output_columns].to_csv(
    OUTPUT_DIR / "shipments_needing_review.csv",
    index=False
)

# --------------------------------------------------
# 6. Print summary
# --------------------------------------------------
print("\n========== ROUTE OPTIMIZATION SUMMARY ==========")
print("Total shipments:", len(all_shipments))
print("Feasible shipments:", len(recommendations))
print("Shipments needing review:", len(unserved))

if not recommendations.empty:
    print(
        "\nTotal estimated transport cost (INR):",
        round(
            recommendations["estimated_cost_inr_simulated"].sum(),
            2
        )
    )

    print(
        "Total estimated distance (km):",
        round(recommendations["distance_km_simulated"].sum(), 2)
    )

    print(
        "\nFirst 10 recommendations:"
    )

    print(
        recommendations[[
            "shipment_id",
            "warehouse_id",
            "district_id",
            "product_id",
            "vehicle_id",
            "estimated_cost_inr_simulated"
        ]].head(10).to_string(index=False)
    )

print("\nSaved:")
print(OUTPUT_DIR / "route_recommendations.csv")
print(OUTPUT_DIR / "shipments_needing_review.csv")

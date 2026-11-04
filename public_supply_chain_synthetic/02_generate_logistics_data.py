#!/usr/bin/env python3
"""
Generate synthetic logistics, route-choice, and warehouse-allocation datasets.

Run AFTER 01_generate_core_data.py:
    python 02_generate_logistics_data.py --input-dir data/core --output-dir data/logistics --seed 43
Requires: pandas, numpy
All records are synthetic; route distances/times are simulated, not live road-network data.
"""
from pathlib import Path
import argparse
import numpy as np
import pandas as pd

def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dp = np.radians(lat2 - lat1)
    dl = np.radians(lon2 - lon1)
    a = np.sin(dp / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(np.clip(a, 0, 1)))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", default="data/core")
    parser.add_argument("--output-dir", default="data/logistics")
    parser.add_argument("--seed", type=int, default=43)
    parser.add_argument("--shipments", type=int, default=5000)
    parser.add_argument("--route-options-per-shipment", type=int, default=3)
    args = parser.parse_args()
    rng = np.random.default_rng(args.seed)
    src, out = Path(args.input_dir), Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    required = ["districts.csv", "warehouses.csv", "products.csv", "monthly_demand_history.csv", "inventory_snapshot.csv"]
    missing = [name for name in required if not (src / name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing {missing}. Run 01_generate_core_data.py first and use --input-dir.")

    districts = pd.read_csv(src / "districts.csv")
    warehouses = pd.read_csv(src / "warehouses.csv")
    products = pd.read_csv(src / "products.csv")
    demand = pd.read_csv(src / "monthly_demand_history.csv")
    inventory = pd.read_csv(src / "inventory_snapshot.csv")

    # Synthetic fleet.
    vehicle_rows = []
    for i in range(1, 61):
        vehicle_rows.append({
            "vehicle_id": f"TRK{i:03d}",
            "vehicle_type": rng.choice(["Mini Truck", "Medium Truck", "Heavy Truck"], p=[.25, .45, .30]),
            "capacity_quintals": int(rng.choice([120, 250, 500, 800, 1200])),
            "fixed_cost_inr": int(rng.integers(1200, 6500)),
            "cost_per_km_inr": round(float(rng.uniform(18, 52)), 2),
            "average_speed_kmph": int(rng.integers(25, 46)),
            "fuel_efficiency_kmpl": round(float(rng.uniform(3.0, 7.5)), 2),
            "availability_flag": int(rng.random() > .12),
        })
    fleet = pd.DataFrame(vehicle_rows)
    fleet.to_csv(out / "vehicle_fleet.csv", index=False)

    # Generate actual historical shipment records.
    shipment_rows, route_rows = [], []
    dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=365, freq="D")
    warehouse_records = warehouses.to_dict("records")
    district_records = districts.to_dict("records")
    product_ids = products["product_id"].tolist()
    wh_coords = {w["warehouse_id"]: (w["latitude"], w["longitude"]) for w in warehouse_records}
    dist_coords = {d["district_id"]: (d["latitude"], d["longitude"]) for d in district_records}
    inv_map = inventory.set_index(["warehouse_id", "product_id"])["on_hand_quintals"].to_dict()
    demand_latest = demand.sort_values("month").groupby(["district_id", "product_id"]).tail(1)
    demand_map = demand_latest.set_index(["district_id", "product_id"])["demand_quintals"].to_dict()

    for n in range(1, args.shipments + 1):
        d = district_records[int(rng.integers(0, len(district_records)))]
        p = product_ids[int(rng.integers(0, len(product_ids)))]
        # Choose a warehouse from a few nearest candidates, with a small probability of a farther one.
        distances = []
        for w in warehouse_records:
            km = float(haversine_km(w["latitude"], w["longitude"], d["latitude"], d["longitude"]))
            road_factor = float(rng.uniform(1.12, 1.55))
            distances.append((w, km * road_factor))
        distances.sort(key=lambda x: x[1])
        shortlist = distances[:min(5, len(distances))]
        w, dist_km = shortlist[int(rng.integers(0, len(shortlist)))]
        base_demand = int(demand_map.get((d["district_id"], p), 300))
        qty = max(20, int(base_demand * rng.uniform(.15, 1.15)))
        order_date = dates[int(rng.integers(0, len(dates)))]
        vehicle = fleet.iloc[int(rng.integers(0, len(fleet)))]
        traffic_factor = float(rng.uniform(1.0, 1.8))
        weather_factor = float(rng.choice([1.0, 1.0, 1.05, 1.2]))
        drive_hours = (dist_km / max(15, vehicle["average_speed_kmph"])) * traffic_factor * weather_factor
        handling_hours = float(rng.uniform(1.0, 4.0))
        delay_hours = max(0.0, float(rng.normal(1.3, 2.0)))
        total_hours = drive_hours + handling_hours + delay_hours
        cost = float(vehicle["fixed_cost_inr"] + dist_km * vehicle["cost_per_km_inr"] + qty * rng.uniform(.5, 2.0))
        shipment_id = f"SHP{n:06d}"
        shipment_rows.append({
            "shipment_id": shipment_id,
            "order_date": order_date.strftime("%Y-%m-%d"),
            "warehouse_id": w["warehouse_id"],
            "district_id": d["district_id"],
            "product_id": p,
            "quantity_quintals": qty,
            "vehicle_id": vehicle["vehicle_id"],
            "road_distance_km_simulated": round(dist_km, 2),
            "travel_time_hours_simulated": round(total_hours, 2),
            "transport_cost_inr_simulated": round(cost, 2),
            "on_time_delivery_flag_simulated": int(delay_hours < 2.0 and total_hours < max(4, drive_hours + handling_hours + 5)),
            "warehouse_stock_at_order_quintals": int(inv_map.get((w["warehouse_id"], p), 0)),
        })

        # Candidate warehouse/route alternatives for allocation and route optimisation.
        candidate_list = distances[:min(args.route_options_per_shipment, len(distances))]
        scored = []
        for rank, (cw, ckm) in enumerate(candidate_list, start=1):
            cvehicle = fleet.iloc[int(rng.integers(0, len(fleet)))]
            traffic = float(rng.uniform(1.0, 1.8))
            ctime = (ckm / max(15, cvehicle["average_speed_kmph"])) * traffic + float(rng.uniform(1, 4))
            cstock = int(inv_map.get((cw["warehouse_id"], p), 0))
            stock_penalty = max(0, qty - cstock) * 2.5
            capacity_penalty = max(0, qty - int(cvehicle["capacity_quintals"])) * 3.0
            ccost = float(cvehicle["fixed_cost_inr"] + ckm * cvehicle["cost_per_km_inr"] + qty * rng.uniform(.5, 2.0))
            # Objective proxy combines cost, time, stock shortfall, and vehicle overload.
            score = ccost + ctime * 450 + stock_penalty + capacity_penalty
            scored.append((cw, ckm, cvehicle, ctime, ccost, score, cstock))
        best_idx = int(np.argmin([x[5] for x in scored]))
        for j, (cw, ckm, cv, ctime, ccost, score, cstock) in enumerate(scored):
            route_rows.append({
                "shipment_id": shipment_id,
                "candidate_id": f"{shipment_id}_C{j+1}",
                "warehouse_id": cw["warehouse_id"],
                "district_id": d["district_id"],
                "product_id": p,
                "quantity_quintals": qty,
                "vehicle_id": cv["vehicle_id"],
                "distance_km_simulated": round(ckm, 2),
                "estimated_time_hours_simulated": round(float(ctime), 2),
                "estimated_cost_inr_simulated": round(float(ccost), 2),
                "available_stock_quintals": cstock,
                "stock_shortfall_quintals": max(0, qty - cstock),
                "vehicle_capacity_quintals": int(cv["capacity_quintals"]),
                "capacity_violation_quintals": max(0, qty - int(cv["capacity_quintals"])),
                "objective_score_proxy": round(float(score), 2),
                "recommended_candidate_label_simulated": int(j == best_idx),
            })

    pd.DataFrame(shipment_rows).to_csv(out / "historical_shipments.csv", index=False)
    pd.DataFrame(route_rows).to_csv(out / "route_allocation_candidates.csv", index=False)

    # Warehouse utilization summary for dashboards and capacity planning.
    stock_summary = inventory.groupby("warehouse_id", as_index=False)["on_hand_quintals"].sum()
    wh_summary = warehouses.merge(stock_summary, on="warehouse_id", how="left")
    wh_summary["utilization_ratio_simulated"] = (
        wh_summary["on_hand_quintals"] / wh_summary["capacity_quintals"]
    ).clip(0, 1.5).round(4)
    wh_summary["over_capacity_flag_simulated"] = (
        wh_summary["on_hand_quintals"] > wh_summary["capacity_quintals"]
    ).astype(int)
    wh_summary.to_csv(out / "warehouse_utilization.csv", index=False)

    print(f"Created logistics synthetic datasets in: {out.resolve()}")
    for f in sorted(out.glob("*.csv")):
        print(f"  {f.name}: {len(pd.read_csv(f)):,} rows")

if __name__ == "__main__":
    main()

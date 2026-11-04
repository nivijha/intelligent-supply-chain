#!/usr/bin/env python3
"""
Generate synthetic core datasets for an AI-Powered Public Supply Chain Intelligence Platform.

Outputs are synthetic demonstration data, NOT official FCI/PDS records.
Requires: pandas, numpy
Run:
    python 01_generate_core_data.py --output-dir data/core --seed 42
"""
from pathlib import Path
import argparse
import numpy as np
import pandas as pd

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="data/core")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--months", type=int, default=36)
    parser.add_argument("--districts", type=int, default=24)
    parser.add_argument("--warehouses", type=int, default=12)
    parser.add_argument("--products", type=int, default=4)
    args = parser.parse_args()
    rng = np.random.default_rng(args.seed)
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    product_templates = [
        ("PDS-RICE", "Rice", "quintal", 1.00, 0.08),
        ("PDS-WHEAT", "Wheat", "quintal", 0.92, 0.07),
        ("PDS-SUGAR", "Sugar", "quintal", 0.25, 0.12),
        ("PDS-PULSES", "Pulses", "quintal", 0.18, 0.15),
    ]
    product_rows = []
    for i in range(min(args.products, len(product_templates))):
        sku, name, unit, base, cv = product_templates[i]
        product_rows.append({
            "product_id": sku, "product_name": name, "unit": unit,
            "priority_weight": round(base, 2), "demand_volatility": cv,
            "shelf_life_days": [365, 270, 365, 180][i],
            "storage_type": "Dry"
        })
    products = pd.DataFrame(product_rows)
    products.to_csv(out / "products.csv", index=False)

    states = ["Himachal Pradesh", "Punjab", "Haryana", "Uttar Pradesh",
              "Rajasthan", "Uttarakhand", "Delhi", "Madhya Pradesh"]
    districts = pd.DataFrame({
        "district_id": [f"D{i:03d}" for i in range(1, args.districts + 1)],
        "district_name": [f"District_{i:03d}" for i in range(1, args.districts + 1)],
        "state": [states[(i - 1) % len(states)] for i in range(1, args.districts + 1)],
        "population_estimate": rng.integers(250_000, 2_500_000, args.districts),
        "rural_share": np.round(rng.uniform(0.45, 0.92, args.districts), 3),
        "road_access_score": np.round(rng.uniform(0.35, 0.98, args.districts), 3),
        "latitude": np.round(rng.uniform(25.0, 32.5, args.districts), 5),
        "longitude": np.round(rng.uniform(74.0, 82.5, args.districts), 5),
    })
    districts.to_csv(out / "districts.csv", index=False)

    # Warehouse locations are selected from generated district locations.
    wh_idx = rng.choice(len(districts), size=min(args.warehouses, args.districts), replace=False)
    wh_rows = []
    for n, idx in enumerate(wh_idx, start=1):
        d = districts.iloc[idx]
        wh_rows.append({
            "warehouse_id": f"WH{n:03d}",
            "warehouse_name": f"Regional_Godown_{n:03d}",
            "district_id": d["district_id"],
            "state": d["state"],
            "latitude": d["latitude"],
            "longitude": d["longitude"],
            "capacity_quintals": int(rng.integers(18_000, 75_000)),
            "handling_capacity_quintals_day": int(rng.integers(350, 1500)),
            "storage_cost_per_quintal_month_inr": round(float(rng.uniform(8, 28)), 2),
            "operating_cost_per_day_inr": int(rng.integers(8000, 30000)),
            "reliability_score": round(float(rng.uniform(0.75, 0.99)), 3),
        })
    warehouses = pd.DataFrame(wh_rows)
    warehouses.to_csv(out / "warehouses.csv", index=False)

    # Monthly demand history: trend + seasonality + district/product differences + noise.
    dates = pd.date_range(end=pd.Timestamp.today().normalize().replace(day=1), periods=args.months, freq="MS")
    demand_rows = []
    district_factor = {r.district_id: float(r.population_estimate / 900_000) for r in districts.itertuples()}
    for d in districts.itertuples():
        for p in products.itertuples():
            product_base = {"PDS-RICE": 760, "PDS-WHEAT": 680, "PDS-SUGAR": 180, "PDS-PULSES": 140}[p.product_id]
            base = product_base * district_factor[d.district_id] * (0.65 + 0.7 * d.rural_share)
            for t, date in enumerate(dates):
                season = 1 + 0.10 * np.sin(2 * np.pi * (date.month / 12)) + (0.06 if date.month in [10, 11, 12] else 0)
                trend = 1 + 0.0025 * t
                shock = rng.normal(1.0, p.demand_volatility)
                demand = max(0, int(round(base * season * trend * max(0.35, shock))))
                demand_rows.append({
                    "month": date.strftime("%Y-%m-01"),
                    "district_id": d.district_id,
                    "product_id": p.product_id,
                    "demand_quintals": demand,
                    "population_estimate": int(d.population_estimate),
                    "festival_season_flag": int(date.month in [10, 11]),
                    "shortage_event_flag": int(rng.random() < 0.025),
                })
    demand = pd.DataFrame(demand_rows)
    demand.to_csv(out / "monthly_demand_history.csv", index=False)

    # Inventory snapshot, intentionally includes stockout/overstock cases for modelling.
    latest_month = dates[-1]
    demand_latest = demand[demand["month"] == latest_month.strftime("%Y-%m-01")]
    inv_rows = []
    wh_ids = warehouses["warehouse_id"].tolist()
    for wh in warehouses.itertuples():
        for p in products.itertuples():
            relevant = demand_latest[demand_latest["product_id"] == p.product_id]["demand_quintals"]
            avg_demand = float(relevant.mean()) if len(relevant) else 300
            stock = max(0, int(avg_demand * rng.uniform(0.3, 3.2)))
            inv_rows.append({
                "snapshot_date": pd.Timestamp.today().strftime("%Y-%m-%d"),
                "warehouse_id": wh.warehouse_id,
                "product_id": p.product_id,
                "on_hand_quintals": stock,
                "reserved_quintals": int(stock * rng.uniform(0, 0.18)),
                "reorder_lead_time_days": int(rng.integers(3, 22)),
                "safety_stock_quintals": int(avg_demand * rng.uniform(0.25, 0.8)),
                "unit_procurement_cost_inr": round(float(rng.uniform(1800, 5200)), 2),
                "expiry_risk_score": round(float(rng.uniform(0, 0.35)), 3),
            })
    inventory = pd.DataFrame(inv_rows)
    inventory.to_csv(out / "inventory_snapshot.csv", index=False)

    # Procurement records suitable for lead-time and supplier-performance analysis.
    suppliers = [f"SUP{i:03d}" for i in range(1, 9)]
    procurement_rows = []
    start = dates[0]
    for n in range(1, 901):
        order_date = start + pd.Timedelta(days=int(rng.integers(0, max(1, args.months * 30))))
        lead = int(rng.integers(3, 25))
        expected = order_date + pd.Timedelta(days=lead)
        delay = int(rng.choice([-2, -1, 0, 0, 0, 1, 2, 4, 7], p=[.05,.08,.35,.15,.10,.10,.08,.06,.03]))
        actual = expected + pd.Timedelta(days=delay)
        product = products.iloc[int(rng.integers(0, len(products)))]
        wh = warehouses.iloc[int(rng.integers(0, len(warehouses)))]
        qty = int(rng.integers(250, 5000))
        procurement_rows.append({
            "procurement_id": f"PO{n:05d}",
            "order_date": order_date.strftime("%Y-%m-%d"),
            "warehouse_id": wh["warehouse_id"],
            "product_id": product["product_id"],
            "supplier_id": suppliers[int(rng.integers(0, len(suppliers)))],
            "ordered_quintals": qty,
            "expected_delivery_date": expected.strftime("%Y-%m-%d"),
            "actual_delivery_date": actual.strftime("%Y-%m-%d"),
            "lead_time_days_actual": max(0, (actual - order_date).days),
            "late_delivery_flag": int(actual > expected),
            "unit_cost_inr": round(float(rng.uniform(1800, 5200)), 2),
        })
    pd.DataFrame(procurement_rows).to_csv(out / "procurement_orders.csv", index=False)

    print(f"Created core synthetic datasets in: {out.resolve()}")
    for f in sorted(out.glob("*.csv")):
        print(f"  {f.name}: {len(pd.read_csv(f)):,} rows")

if __name__ == "__main__":
    main()

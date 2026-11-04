import csv
import os
from pathlib import Path

import psycopg

DATA_DIR = Path(__file__).resolve().parents[2] / "public_supply_chain_synthetic" / "data"
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain")


def to_float(v):
    return None if v in (None, "") else float(v)


def to_int(v):
    return None if v in (None, "") else int(float(v))


def main():
    rows = list(csv.DictReader((DATA_DIR / "logistics" / "route_allocation_candidates.csv").open()))
    conn = psycopg.connect(DATABASE_URL)
    with conn.cursor() as cur:
        for r in rows:
            cur.execute(
                """
                INSERT INTO route_candidates (
                    candidate_id, shipment_id, warehouse_id, district_id, product_id,
                    quantity_quintals, vehicle_id, distance_km_simulated,
                    estimated_time_hours_simulated, estimated_cost_inr_simulated,
                    available_stock_quintals, stock_shortfall_quintals,
                    vehicle_capacity_quintals, capacity_violation_quintals,
                    objective_score_proxy, recommended_candidate_label_simulated
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (candidate_id) DO NOTHING
                """,
                (
                    r["candidate_id"],
                    r["shipment_id"],
                    r["warehouse_id"],
                    r["district_id"],
                    r["product_id"],
                    to_float(r["quantity_quintals"]),
                    r["vehicle_id"],
                    to_float(r["distance_km_simulated"]),
                    to_float(r["estimated_time_hours_simulated"]),
                    to_float(r["estimated_cost_inr_simulated"]),
                    to_float(r["available_stock_quintals"]),
                    to_float(r["stock_shortfall_quintals"]),
                    to_float(r["vehicle_capacity_quintals"]),
                    to_float(r["capacity_violation_quintals"]),
                    to_float(r["objective_score_proxy"]),
                    to_int(r["recommended_candidate_label_simulated"]),
                ),
            )
    conn.commit()
    conn.close()
    print(f"Seeded {len(rows)} route candidates")


if __name__ == "__main__":
    main()

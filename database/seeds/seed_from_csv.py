"""Seed PostgreSQL from the synthetic CSV datasets."""

from __future__ import annotations

import csv
import os
from datetime import date, datetime
from pathlib import Path

import psycopg

DATA_DIR = Path(__file__).resolve().parents[2] / "public_supply_chain_synthetic" / "data"
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
)


def read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def to_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def to_date(value: str) -> date | None:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def to_float(value: str) -> float | None:
    if value in (None, ""):
        return None
    return float(value)


def to_int(value: str) -> int | None:
    if value in (None, ""):
        return None
    return int(float(value))


def main() -> None:
    conn = psycopg.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            # Roles
            for role in ("ADMIN", "PLANNER", "WAREHOUSE_MANAGER", "ANALYST"):
                cur.execute(
                    "INSERT INTO roles (name) VALUES (%s) ON CONFLICT (name) DO NOTHING",
                    (role,),
                )

            # Districts
            for row in read_csv(DATA_DIR / "core" / "districts.csv"):
                cur.execute(
                    """
                    INSERT INTO districts (
                        district_id, district_name, state, population_estimate,
                        rural_share, road_access_score, latitude, longitude
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (district_id) DO NOTHING
                    """,
                    (
                        row["district_id"],
                        row["district_name"],
                        row["state"],
                        to_int(row["population_estimate"]),
                        to_float(row["rural_share"]),
                        to_float(row["road_access_score"]),
                        to_float(row["latitude"]),
                        to_float(row["longitude"]),
                    ),
                )

            # Products
            for row in read_csv(DATA_DIR / "core" / "products.csv"):
                cur.execute(
                    """
                    INSERT INTO products (
                        product_id, product_name, unit, priority_weight,
                        demand_volatility, shelf_life_days, storage_type
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (product_id) DO NOTHING
                    """,
                    (
                        row["product_id"],
                        row["product_name"],
                        row["unit"],
                        to_float(row["priority_weight"]),
                        to_float(row["demand_volatility"]),
                        to_int(row["shelf_life_days"]),
                        row["storage_type"],
                    ),
                )

            # Warehouses
            for row in read_csv(DATA_DIR / "core" / "warehouses.csv"):
                cur.execute(
                    """
                    INSERT INTO warehouses (
                        warehouse_id, warehouse_name, location_district_id, state,
                        latitude, longitude, capacity_quintals,
                        handling_capacity_quintals_day, storage_cost_per_quintal_month_inr,
                        operating_cost_per_day_inr, reliability_score
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (warehouse_id) DO NOTHING
                    """,
                    (
                        row["warehouse_id"],
                        row["warehouse_name"],
                        row["district_id"],
                        row["state"],
                        to_float(row["latitude"]),
                        to_float(row["longitude"]),
                        to_float(row["capacity_quintals"]),
                        to_float(row["handling_capacity_quintals_day"]),
                        to_float(row["storage_cost_per_quintal_month_inr"]),
                        to_float(row["operating_cost_per_day_inr"]),
                        to_float(row["reliability_score"]),
                    ),
                )

            # Warehouse-district service mapping from route candidates
            mapping = set()
            for row in read_csv(DATA_DIR / "logistics" / "route_allocation_candidates.csv"):
                mapping.add((row["warehouse_id"], row["district_id"]))
            for warehouse_id, district_id in sorted(mapping):
                cur.execute(
                    """
                    INSERT INTO warehouse_districts (warehouse_id, district_id)
                    VALUES (%s,%s) ON CONFLICT DO NOTHING
                    """,
                    (warehouse_id, district_id),
                )

            # Vehicles
            for row in read_csv(DATA_DIR / "logistics" / "vehicle_fleet.csv"):
                cur.execute(
                    """
                    INSERT INTO vehicles (
                        vehicle_id, vehicle_type, capacity_quintals, fixed_cost_inr,
                        cost_per_km_inr, average_speed_kmph, fuel_efficiency_kmpl,
                        availability_flag
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (vehicle_id) DO NOTHING
                    """,
                    (
                        row["vehicle_id"],
                        row["vehicle_type"],
                        to_float(row["capacity_quintals"]),
                        to_float(row["fixed_cost_inr"]),
                        to_float(row["cost_per_km_inr"]),
                        to_float(row["average_speed_kmph"]),
                        to_float(row["fuel_efficiency_kmpl"]),
                        to_bool(row["availability_flag"]),
                    ),
                )

            # Historical demand
            for row in read_csv(DATA_DIR / "core" / "monthly_demand_history.csv"):
                cur.execute(
                    """
                    INSERT INTO historical_demand (
                        district_id, product_id, month, demand_quintals,
                        population_estimate, festival_season_flag, shortage_event_flag
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (district_id, product_id, month) DO NOTHING
                    """,
                    (
                        row["district_id"],
                        row["product_id"],
                        to_date(row["month"]),
                        to_float(row["demand_quintals"]),
                        to_int(row["population_estimate"]),
                        to_bool(row["festival_season_flag"]),
                        to_bool(row["shortage_event_flag"]),
                    ),
                )

            # Inventory
            for row in read_csv(DATA_DIR / "core" / "inventory_snapshot.csv"):
                cur.execute(
                    """
                    INSERT INTO inventory (
                        warehouse_id, product_id, snapshot_date, on_hand_quintals,
                        reserved_quintals, reorder_lead_time_days, safety_stock_quintals,
                        unit_procurement_cost_inr, expiry_risk_score
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (warehouse_id, product_id) DO NOTHING
                    """,
                    (
                        row["warehouse_id"],
                        row["product_id"],
                        to_date(row["snapshot_date"]),
                        to_float(row["on_hand_quintals"]),
                        to_float(row["reserved_quintals"]),
           
                        to_int(row["reorder_lead_time_days"]),
                        to_float(row["safety_stock_quintals"]),
                        to_float(row["unit_procurement_cost_inr"]),
                        to_float(row["expiry_risk_score"]),
                    ),
                )

            # Shipments
            for row in read_csv(DATA_DIR / "logistics" / "historical_shipments.csv"):
                cur.execute(
                    """
                    INSERT INTO shipments (
                        shipment_id, order_date, warehouse_id, district_id, product_id,
                        quantity_quintals, vehicle_id, distance_km, travel_time_hours,
                        transport_cost_inr, on_time_delivery_flag, warehouse_stock_at_order
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (shipment_id) DO NOTHING
                    """,
                    (
                        row["shipment_id"],
                        to_date(row["order_date"]),
                        row["warehouse_id"],
                        row["district_id"],
                        row["product_id"],
                        to_float(row["quantity_quintals"]),
                        row["vehicle_id"],
                        to_float(row["road_distance_km_simulated"]),
                        to_float(row["travel_time_hours_simulated"]),
                        to_float(row["transport_cost_inr_simulated"]),
                        to_bool(row["on_time_delivery_flag_simulated"]),
                        to_float(row["warehouse_stock_at_order_quintals"]),
                    ),
                )

        conn.commit()
        print("Seed completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

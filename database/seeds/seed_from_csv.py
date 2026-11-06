"""Seed PostgreSQL from the synthetic CSV datasets."""

from __future__ import annotations

import argparse
import csv
import os
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

import psycopg

DATA_DIR = Path(__file__).resolve().parents[2] / "public_supply_chain_synthetic" / "data"
BATCH_SIZE = 1000

LOCAL_HOSTNAMES = {"localhost", "127.0.0.1", "::1"}


def sanitize_db_error(phase: str) -> str:
    """Return a credential-free error message for a database failure phase.

    Raw psycopg exceptions can embed the full connection URI (including
    credentials), so they are never printed directly.
    """
    return f"database {phase} failed (connection aborted)"


def read_csv(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        yield from csv.DictReader(handle)


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


def validate_target(target: str, database_url: str) -> None:
    """Validate the database URL scheme, hostname, and path against the target."""
    parsed = urlparse(database_url)
    scheme = (parsed.scheme or "").lower()
    if scheme not in {"postgresql", "postgres"}:
        print(
            f"ERROR: Unsupported URL scheme {scheme!r}; only postgresql/postgres are supported.",
            flush=True,
        )
        sys.exit(1)
    hostname = parsed.hostname or ""
    if not hostname:
        print(
            "ERROR: DATABASE_URL must include a database host (hostname is missing).",
            flush=True,
        )
        sys.exit(1)
    path = parsed.path or ""
    if not path or path == "/":
        print(
            "ERROR: DATABASE_URL must include a database name (path is missing).",
            flush=True,
        )
        sys.exit(1)
    if target == "neon":
        if not hostname.endswith(".neon.tech"):
            print(
                f"ERROR: --target neon requires a Neon hostname (ending in .neon.tech), "
                f"got {hostname!r}",
                flush=True,
            )
            sys.exit(1)
    elif target == "local":
        if hostname not in LOCAL_HOSTNAMES:
            print(
                f"ERROR: --target local requires hostname localhost/127.0.0.1/::1, "
                f"got {hostname!r}",
                flush=True,
            )
            sys.exit(1)


def insert_batch(cur, sql, row_iter, table_name: str, batch_size: int = BATCH_SIZE) -> int:
    """Insert rows in batches using executemany, logging progress after each batch."""
    total = 0
    batch = []
    for params in row_iter:
        batch.append(params)
        if len(batch) >= batch_size:
            cur.executemany(sql, batch)
            total += len(batch)
            print(f"[PROGRESS] {table_name}: {total} rows processed", flush=True)
            batch = []
    if batch:
        cur.executemany(sql, batch)
        total += len(batch)
    print(f"[COMPLETE] {table_name}: {total} rows processed", flush=True)
    return total


def import_roles(cur) -> int:
    roles = ("ADMIN", "PLANNER", "WAREHOUSE_MANAGER", "ANALYST")
    sql = "INSERT INTO roles (name) VALUES (%s) ON CONFLICT (name) DO NOTHING"
    return insert_batch(cur, sql, ((role,) for role in roles), "roles")


def import_districts(cur) -> int:
    sql = """
        INSERT INTO districts (
            district_id, district_name, state, population_estimate,
            rural_share, road_access_score, latitude, longitude
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (district_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "core" / "districts.csv"):
            yield (
                row["district_id"],
                row["district_name"],
                row["state"],
                to_int(row["population_estimate"]),
                to_float(row["rural_share"]),
                to_float(row["road_access_score"]),
                to_float(row["latitude"]),
                to_float(row["longitude"]),
            )

    return insert_batch(cur, sql, rows(), "districts")


def import_products(cur) -> int:
    sql = """
        INSERT INTO products (
            product_id, product_name, unit, priority_weight,
            demand_volatility, shelf_life_days, storage_type
        ) VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (product_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "core" / "products.csv"):
            yield (
                row["product_id"],
                row["product_name"],
                row["unit"],
                to_float(row["priority_weight"]),
                to_float(row["demand_volatility"]),
                to_int(row["shelf_life_days"]),
                row["storage_type"],
            )

    return insert_batch(cur, sql, rows(), "products")


def import_warehouses(cur) -> int:
    sql = """
        INSERT INTO warehouses (
            warehouse_id, warehouse_name, location_district_id, state,
            latitude, longitude, capacity_quintals,
            handling_capacity_quintals_day, storage_cost_per_quintal_month_inr,
            operating_cost_per_day_inr, reliability_score
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (warehouse_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "core" / "warehouses.csv"):
            yield (
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
            )

    return insert_batch(cur, sql, rows(), "warehouses")


def import_warehouse_districts(cur) -> int:
    sql = """
        INSERT INTO warehouse_districts (warehouse_id, district_id)
        VALUES (%s,%s) ON CONFLICT DO NOTHING
    """

    def rows():
        mapping = set()
        for row in read_csv(DATA_DIR / "logistics" / "route_allocation_candidates.csv"):
            mapping.add((row["warehouse_id"], row["district_id"]))
        for warehouse_id, district_id in sorted(mapping):
            yield (warehouse_id, district_id)

    return insert_batch(cur, sql, rows(), "warehouse_districts")


def import_vehicles(cur) -> int:
    sql = """
        INSERT INTO vehicles (
            vehicle_id, vehicle_type, capacity_quintals, fixed_cost_inr,
            cost_per_km_inr, average_speed_kmph, fuel_efficiency_kmpl,
            availability_flag
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (vehicle_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "logistics" / "vehicle_fleet.csv"):
            yield (
                row["vehicle_id"],
                row["vehicle_type"],
                to_float(row["capacity_quintals"]),
                to_float(row["fixed_cost_inr"]),
                to_float(row["cost_per_km_inr"]),
                to_float(row["average_speed_kmph"]),
                to_float(row["fuel_efficiency_kmpl"]),
                to_bool(row["availability_flag"]),
            )

    return insert_batch(cur, sql, rows(), "vehicles")


def import_historical_demand(cur) -> int:
    sql = """
        INSERT INTO historical_demand (
            district_id, product_id, month, demand_quintals,
            population_estimate, festival_season_flag, shortage_event_flag
        ) VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (district_id, product_id, month) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "core" / "monthly_demand_history.csv"):
            yield (
                row["district_id"],
                row["product_id"],
                to_date(row["month"]),
                to_float(row["demand_quintals"]),
                to_int(row["population_estimate"]),
                to_bool(row["festival_season_flag"]),
                to_bool(row["shortage_event_flag"]),
            )

    return insert_batch(cur, sql, rows(), "historical_demand")


def import_inventory(cur) -> int:
    sql = """
        INSERT INTO inventory (
            warehouse_id, product_id, snapshot_date, on_hand_quintals,
            reserved_quintals, reorder_lead_time_days, safety_stock_quintals,
            unit_procurement_cost_inr, expiry_risk_score
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (warehouse_id, product_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "core" / "inventory_snapshot.csv"):
            yield (
                row["warehouse_id"],
                row["product_id"],
                to_date(row["snapshot_date"]),
                to_float(row["on_hand_quintals"]),
                to_float(row["reserved_quintals"]),
                to_int(row["reorder_lead_time_days"]),
                to_float(row["safety_stock_quintals"]),
                to_float(row["unit_procurement_cost_inr"]),
                to_float(row["expiry_risk_score"]),
            )

    return insert_batch(cur, sql, rows(), "inventory")


def import_shipments(cur) -> int:
    sql = """
        INSERT INTO shipments (
            shipment_id, order_date, warehouse_id, district_id, product_id,
            quantity_quintals, vehicle_id, distance_km, travel_time_hours,
            transport_cost_inr, on_time_delivery_flag, warehouse_stock_at_order
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (shipment_id) DO NOTHING
    """

    def rows():
        for row in read_csv(DATA_DIR / "logistics" / "historical_shipments.csv"):
            yield (
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
            )

    return insert_batch(cur, sql, rows(), "shipments")


IMPORTERS = (
    ("roles", import_roles),
    ("districts", import_districts),
    ("products", import_products),
    ("warehouses", import_warehouses),
    ("warehouse_districts", import_warehouse_districts),
    ("vehicles", import_vehicles),
    ("historical_demand", import_historical_demand),
    ("inventory", import_inventory),
    ("shipments", import_shipments),
)

TABLE_COUNT_SQL = {
    "roles": "SELECT COUNT(*) FROM roles",
    "districts": "SELECT COUNT(*) FROM districts",
    "products": "SELECT COUNT(*) FROM products",
    "warehouses": "SELECT COUNT(*) FROM warehouses",
    "warehouse_districts": "SELECT COUNT(*) FROM warehouse_districts",
    "vehicles": "SELECT COUNT(*) FROM vehicles",
    "historical_demand": "SELECT COUNT(*) FROM historical_demand",
    "inventory": "SELECT COUNT(*) FROM inventory",
    "shipments": "SELECT COUNT(*) FROM shipments",
}


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Seed PostgreSQL from the synthetic CSV datasets.",
    )
    parser.add_argument(
        "--target",
        required=True,
        choices=["neon", "local"],
        help="Deployment target: 'neon' (hostname must end in .neon.tech) or 'local' "
        "(hostname must be localhost/127.0.0.1/::1).",
    )
    return parser.parse_args(argv)


def main() -> None:
    args = parse_args()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is required.", flush=True)
        sys.exit(1)

    validate_target(args.target, database_url)
    hostname = urlparse(database_url).hostname or "<unknown>"
    print(
        f"[START] Seeding database (target={args.target}, host={hostname})",
        flush=True,
    )

    processed_counts = {}

    try:
        with psycopg.connect(database_url) as conn:
            for table_name, importer in IMPORTERS:
                print(f"[START] Importing {table_name}", flush=True)
                with conn.cursor() as cur:
                    processed_counts[table_name] = importer(cur)
            conn.commit()
    except Exception:  # noqa: BLE001 - do not leak connection details
        print(f"ERROR: {sanitize_db_error('import')}", flush=True)
        raise SystemExit(1) from None

    print("[COMPLETE] All tables imported successfully.", flush=True)
    print("", flush=True)
    print("[VERIFICATION] Rows processed by script vs rows present in database:", flush=True)
    print(
        f"{'table':<24} {'processed':>10} {'in_database':>12}",
        flush=True,
    )
    try:
        with psycopg.connect(database_url) as conn:
            for table_name, _ in IMPORTERS:
                processed = processed_counts.get(table_name, 0)
                with conn.cursor() as cur:
                    cur.execute(TABLE_COUNT_SQL[table_name])
                    in_database = cur.fetchone()[0]
                print(
                    f"{table_name:<24} {processed:>10} {in_database:>12}",
                    flush=True,
                )
    except Exception:  # noqa: BLE001 - do not leak connection details
        print(f"ERROR: {sanitize_db_error('verification')}", flush=True)
        raise SystemExit(1) from None

    print("[DONE] Seed import finished.", flush=True)


if __name__ == "__main__":
    main()

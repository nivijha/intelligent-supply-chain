"""Route and vehicle allocation optimization."""

from __future__ import annotations

import numpy as np
import pandas as pd


REQUIRED_CANDIDATE_COLUMNS = {
    "shipment_id",
    "candidate_id",
    "warehouse_id",
    "district_id",
    "product_id",
    "quantity_quintals",
    "vehicle_id",
}


def validate_candidates(df: pd.DataFrame) -> None:
    missing = REQUIRED_CANDIDATE_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing route candidate columns: {sorted(missing)}")


def _vehicle_capacity_column(df: pd.DataFrame) -> str:
    if "fleet_capacity_quintals" in df.columns:
        return "fleet_capacity_quintals"
    if "vehicle_capacity_quintals" in df.columns:
        return "vehicle_capacity_quintals"
    if "capacity_quintals" in df.columns:
        return "capacity_quintals"
    raise ValueError("No vehicle capacity column found")


def _available_stock_column(df: pd.DataFrame) -> str:
    if "current_available_stock" in df.columns:
        return "current_available_stock"
    if "available_stock_quintals" in df.columns:
        return "available_stock_quintals"
    raise ValueError("No available stock column found")


def _merge_supporting_data(
    candidates: pd.DataFrame,
    vehicles: pd.DataFrame | None,
    inventory: pd.DataFrame | None,
) -> pd.DataFrame:
    result = candidates.copy()

    if vehicles is not None:
        vehicle_cols = ["vehicle_id"]
        for col in ("capacity_quintals", "availability_flag"):
            if col in vehicles.columns:
                vehicle_cols.append(col)
        if len(vehicle_cols) > 1:
            rename = {}
            if "capacity_quintals" in vehicle_cols:
                rename["capacity_quintals"] = "fleet_capacity_quintals"
            if "availability_flag" in vehicle_cols:
                rename["availability_flag"] = "vehicle_available"
            result = result.merge(
                vehicles[vehicle_cols].rename(columns=rename),
                on="vehicle_id",
                how="left",
                validate="many_to_one",
                suffixes=("", "_fleet"),
            )

    if inventory is not None:
        inv_cols = ["warehouse_id", "product_id"]
        if "current_available_stock" in inventory.columns:
            inv_cols.append("current_available_stock")
        elif {"on_hand_quintals", "reserved_quintals"}.issubset(inventory.columns):
            inventory = inventory.copy()
            inventory["current_available_stock"] = (
                inventory["on_hand_quintals"] - inventory["reserved_quintals"]
            ).clip(lower=0)
            inv_cols.append("current_available_stock")
        if len(inv_cols) > 2:
            result = result.merge(
                inventory[inv_cols].drop_duplicates(),
                on=["warehouse_id", "product_id"],
                how="left",
                validate="many_to_one",
                suffixes=("", "_inventory"),
            )

    # Prefer inventory-derived stock when both candidate and inventory stock exist.
    if "current_available_stock" in result.columns and "available_stock_quintals" in result.columns:
        result["available_stock_quintals"] = result["current_available_stock"].combine_first(
            result["available_stock_quintals"]
        )

    return result


def optimize_routes(
    candidates: pd.DataFrame,
    vehicles: pd.DataFrame | None = None,
    inventory: pd.DataFrame | None = None,
) -> dict[str, pd.DataFrame | dict]:
    validate_candidates(candidates)
    routes = _merge_supporting_data(candidates, vehicles, inventory)

    capacity_col = _vehicle_capacity_column(routes)
    stock_col = _available_stock_column(routes)

    routes["vehicle_capacity_ok"] = routes["quantity_quintals"] <= routes[capacity_col]
    routes["stock_available_ok"] = routes["quantity_quintals"] <= routes[stock_col]
    if "capacity_violation_quintals" in routes.columns:
        routes["route_capacity_ok"] = routes["capacity_violation_quintals"].fillna(0) <= 0
    else:
        routes["route_capacity_ok"] = True

    if "vehicle_available" in routes.columns:
        routes["vehicle_available_ok"] = routes["vehicle_available"].fillna(0).astype(int) == 1
    elif "availability_flag" in routes.columns:
        routes["vehicle_available_ok"] = routes["availability_flag"].fillna(0).astype(int) == 1
    else:
        routes["vehicle_available_ok"] = True

    routes["stock_known_ok"] = routes[stock_col].notna()
    if "estimated_cost_inr_simulated" in routes.columns:
        routes["cost_known_ok"] = routes["estimated_cost_inr_simulated"].notna()
    else:
        routes["cost_known_ok"] = True

    routes["feasible"] = (
        routes["vehicle_capacity_ok"]
        & routes["stock_available_ok"]
        & routes["route_capacity_ok"]
        & routes["vehicle_available_ok"]
        & routes["stock_known_ok"]
        & routes["cost_known_ok"]
    )

    feasible = routes[routes["feasible"]].copy()
    sort_cols = ["shipment_id"]
    if "estimated_cost_inr_simulated" in feasible.columns:
        sort_cols.append("estimated_cost_inr_simulated")
    if "estimated_time_hours_simulated" in feasible.columns:
        sort_cols.append("estimated_time_hours_simulated")
    feasible = feasible.sort_values(sort_cols)
    recommendations = feasible.drop_duplicates(subset=["shipment_id"], keep="first").copy()
    recommendations["recommendation_status"] = "FEASIBLE_LOWEST_COST"

    all_shipments = routes["shipment_id"].drop_duplicates()
    selected = set(recommendations["shipment_id"].tolist())
    unserved_ids = [sid for sid in all_shipments if sid not in selected]
    unserved = routes[routes["shipment_id"].isin(unserved_ids)].copy()

    if not unserved.empty:
        sort_cols_unserved = ["shipment_id"]
        if "stock_shortfall_quintals" in unserved.columns:
            sort_cols_unserved.append("stock_shortfall_quintals")
        if "capacity_violation_quintals" in unserved.columns:
            sort_cols_unserved.append("capacity_violation_quintals")
        if "estimated_cost_inr_simulated" in unserved.columns:
            sort_cols_unserved.append("estimated_cost_inr_simulated")
        unserved = unserved.sort_values(sort_cols_unserved)
        unserved = unserved.drop_duplicates(subset=["shipment_id"], keep="first").copy()
    unserved["recommendation_status"] = "NO_FEASIBLE_CANDIDATE"

    summary = {
        "total_shipments": int(len(all_shipments)),
        "feasible_shipments": int(len(recommendations)),
        "shipments_needing_review": int(len(unserved)),
    }
    if "estimated_cost_inr_simulated" in recommendations.columns and not recommendations.empty:
        summary["total_estimated_cost_inr"] = float(recommendations["estimated_cost_inr_simulated"].sum())
    if "distance_km_simulated" in recommendations.columns and not recommendations.empty:
        summary["total_distance_km"] = float(recommendations["distance_km_simulated"].sum())

    return {
        "routes": routes,
        "recommendations": recommendations.reset_index(drop=True),
        "unserved": unserved.reset_index(drop=True),
        "summary": summary,
    }

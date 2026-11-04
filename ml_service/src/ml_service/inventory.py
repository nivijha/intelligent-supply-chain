"""Forecast-driven inventory optimization."""

from __future__ import annotations

from typing import Iterable

import numpy as np
import pandas as pd


REQUIRED_INVENTORY_COLUMNS = {
    "warehouse_id",
    "product_id",
    "on_hand_quintals",
    "reserved_quintals",
    "reorder_lead_time_days",
    "safety_stock_quintals",
    "unit_procurement_cost_inr",
}


def validate_inventory(df: pd.DataFrame) -> None:
    missing = REQUIRED_INVENTORY_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing inventory columns: {sorted(missing)}")


def _demand_by_warehouse_product(
    forecast: pd.DataFrame,
    warehouse_districts: pd.DataFrame | None,
    warehouses: pd.DataFrame | None,
) -> pd.DataFrame:
    if "district_id" not in forecast.columns or "product_id" not in forecast.columns:
        raise ValueError("forecast must contain district_id and product_id")
    if "predicted_demand_quintals" not in forecast.columns:
        raise ValueError("forecast must contain predicted_demand_quintals")

    demand_col = "predicted_demand_quintals"
    if warehouse_districts is None:
        if warehouses is None or "district_id" not in warehouses.columns:
            raise ValueError("warehouse_districts or warehouses with district_id is required")
        warehouse_districts = warehouses[["warehouse_id", "district_id"]].drop_duplicates()

    required = {"warehouse_id", "district_id"}
    if not required.issubset(warehouse_districts.columns):
        raise ValueError("warehouse_districts must contain warehouse_id and district_id")

    merged = forecast.merge(warehouse_districts, on="district_id", how="inner", validate="many_to_many")
    grouped = (
        merged.groupby(["warehouse_id", "product_id"], as_index=False)[demand_col]
        .sum()
        .rename(columns={demand_col: "forecast_demand_quintals"})
    )
    # Convert a multi-month forecast total into an average monthly demand.
    months = forecast["forecast_month"].nunique() if "forecast_month" in forecast.columns else 1
    months = max(int(months), 1)
    grouped["average_monthly_demand_quintals"] = grouped["forecast_demand_quintals"] / months
    grouped["average_daily_demand_quintals"] = grouped["average_monthly_demand_quintals"] / 30.0
    return grouped


def _incoming_by_warehouse_product(incoming: pd.DataFrame | None) -> pd.DataFrame:
    if incoming is None:
        return pd.DataFrame(columns=["warehouse_id", "product_id", "incoming_quintals"])
    if not {"warehouse_id", "product_id", "incoming_quintals"}.issubset(incoming.columns):
        raise ValueError("incoming must contain warehouse_id, product_id, incoming_quintals")
    return incoming.groupby(["warehouse_id", "product_id"], as_index=False)["incoming_quintals"].sum()


def optimize_inventory(
    inventory: pd.DataFrame,
    forecast: pd.DataFrame,
    warehouse_districts: pd.DataFrame | None = None,
    warehouses: pd.DataFrame | None = None,
    incoming: pd.DataFrame | None = None,
    storage_capacity: pd.DataFrame | None = None,
) -> pd.DataFrame:
    validate_inventory(inventory)
    result = inventory.copy()

    demand = _demand_by_warehouse_product(forecast, warehouse_districts, warehouses)
    result = result.merge(demand, on=["warehouse_id", "product_id"], how="left", validate="many_to_one")
    if result["average_daily_demand_quintals"].isna().any():
        missing = result[result["average_daily_demand_quintals"].isna()][["warehouse_id", "product_id"]]
        raise ValueError(f"No forecast demand for inventory rows: {missing.to_dict('records')}")

    incoming_totals = _incoming_by_warehouse_product(incoming)
    result = result.merge(incoming_totals, on=["warehouse_id", "product_id"], how="left", validate="many_to_one")
    if "incoming_quintals" not in result.columns:
        result["incoming_quintals"] = 0
    result["incoming_quintals"] = result["incoming_quintals"].fillna(0)

    if storage_capacity is not None:
        cap_cols = ["warehouse_id", "capacity_quintals"]
        if not set(cap_cols).issubset(storage_capacity.columns):
            raise ValueError("storage_capacity must contain warehouse_id and capacity_quintals")
        result = result.merge(
            storage_capacity[cap_cols].drop_duplicates(),
            on="warehouse_id",
            how="left",
            validate="many_to_one",
        )
    elif warehouses is not None and "capacity_quintals" in warehouses.columns:
        result = result.merge(
            warehouses[["warehouse_id", "capacity_quintals"]].drop_duplicates(),
            on="warehouse_id",
            how="left",
            validate="many_to_one",
        )
    else:
        result["capacity_quintals"] = np.nan

    result["available_stock_quintals"] = (
        result["on_hand_quintals"] - result["reserved_quintals"] + result["incoming_quintals"]
    ).clip(lower=0)

    result["lead_time_demand_quintals"] = (
        result["average_daily_demand_quintals"] * result["reorder_lead_time_days"]
    )
    result["reorder_point_quintals"] = (
        result["lead_time_demand_quintals"] + result["safety_stock_quintals"]
    )

    result["shortage_quintals"] = (
        result["reorder_point_quintals"] - result["available_stock_quintals"]
    ).clip(lower=0)

    result["recommended_order_quintals"] = np.ceil(result["shortage_quintals"]).astype(int)

    # Cap recommendations by remaining storage capacity when it is known.
    if "capacity_quintals" in result.columns and result["capacity_quintals"].notna().any():
        result["capacity_quintals"] = pd.to_numeric(result["capacity_quintals"], errors="coerce")
        result["on_hand_quintals"] = pd.to_numeric(result["on_hand_quintals"], errors="coerce")
        result["remaining_capacity_quintals"] = (
            result["capacity_quintals"] - result["on_hand_quintals"]
        ).clip(lower=0)
        result["capacity_constrained"] = (
            result["recommended_order_quintals"] > result["remaining_capacity_quintals"]
        )
        result["recommended_order_quintals"] = np.minimum(
            result["recommended_order_quintals"],
            result["remaining_capacity_quintals"].fillna(result["recommended_order_quintals"]),
        ).astype(int)
    else:
        result["remaining_capacity_quintals"] = np.nan
        result["capacity_constrained"] = False

    result["estimated_order_cost_inr"] = (
        result["recommended_order_quintals"] * result["unit_procurement_cost_inr"]
    )

    result["stock_status"] = np.where(
        result["available_stock_quintals"] <= result["reorder_point_quintals"],
        "REORDER",
        "SUFFICIENT",
    )

    result["risk_level"] = "NORMAL"
    result.loc[result["available_stock_quintals"] <= 0, "risk_level"] = "CRITICAL"
    result.loc[
        (result["available_stock_quintals"] > 0)
        & (result["available_stock_quintals"] <= result["reorder_point_quintals"]),
        "risk_level",
    ] = "LOW"
    overstock_mask = result["available_stock_quintals"] > (
        2 * result["lead_time_demand_quintals"].clip(lower=1)
    )
    result.loc[overstock_mask, "risk_level"] = "OVERSTOCK"

    return result

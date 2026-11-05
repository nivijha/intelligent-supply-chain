import pandas as pd

from ml_service.config import DATA_DIR
from ml_service.demand import forecast_demand
from ml_service.inventory import optimize_inventory


def test_inventory_reorder_logic(model_artifact):
    history = pd.read_csv(DATA_DIR / "core" / "monthly_demand_history.csv")
    forecast = forecast_demand(history, 1, model_artifact)
    inv = pd.read_csv(DATA_DIR / "core" / "inventory_snapshot.csv")
    wh = pd.read_csv(DATA_DIR / "core" / "warehouses.csv")
    cand = pd.read_csv(DATA_DIR / "logistics" / "route_allocation_candidates.csv")
    wd = cand[["warehouse_id", "district_id"]].drop_duplicates()
    out = optimize_inventory(inv.head(5), forecast, warehouse_districts=wd, warehouses=wh)
    assert "recommended_order_quintals" in out.columns
    assert (out["recommended_order_quintals"] >= 0).all()

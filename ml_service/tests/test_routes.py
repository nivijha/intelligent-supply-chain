import pandas as pd

from ml_service.config import DATA_DIR
from ml_service.routes import optimize_routes


def test_route_feasibility():
    candidates = pd.read_csv(DATA_DIR / "logistics" / "route_allocation_candidates.csv")
    vehicles = pd.read_csv(DATA_DIR / "logistics" / "vehicle_fleet.csv")
    inventory = pd.read_csv(DATA_DIR / "core" / "inventory_snapshot.csv")
    result = optimize_routes(candidates.head(100), vehicles, inventory)
    assert result["summary"]["feasible_shipments"] >= 0
    assert set(result["recommendations"]["recommendation_status"]) <= {"FEASIBLE_LOWEST_COST"}

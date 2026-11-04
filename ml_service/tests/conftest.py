import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))


import pandas as pd
from ml_service.config import DATA_DIR


def pytest_configure(config):
    pass


import pytest


@pytest.fixture
def sample_history():
    history = pd.read_csv(DATA_DIR / "core" / "monthly_demand_history.csv")
    return history[
        (history["district_id"].isin(["D001", "D002"])) & (history["product_id"] == "PDS-RICE")
    ].copy()

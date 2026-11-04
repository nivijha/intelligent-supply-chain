import pandas as pd

from fastapi.testclient import TestClient
from ml_service.api.app import app
from ml_service.config import DATA_DIR, DEMAND_MODEL_PATH
from ml_service.demand import load_artifact

app.state.artifact = load_artifact(DEMAND_MODEL_PATH)
client = TestClient(app)


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["model_loaded"] is True


def test_forecast_endpoint():
    r = client.post("/api/v1/demand/forecast", json={"horizon": 1})
    assert r.status_code == 200
    assert r.json()["count"] > 0


def test_models_endpoint():
    r = client.get("/api/v1/models")
    assert r.status_code == 200
    assert r.json()["models"][0]["model_version"]

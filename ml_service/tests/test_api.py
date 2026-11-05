import pytest

from fastapi.testclient import TestClient
from ml_service.api.app import app
from ml_service.config import DATA_DIR


@pytest.fixture(scope="module")
def client(model_artifact):
    with TestClient(app) as test_client:
        app.state.artifact = model_artifact
        yield test_client
    app.state.artifact = None


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["model_loaded"] is True


def test_forecast_endpoint(client):
    r = client.post("/api/v1/demand/forecast", json={"horizon": 1})
    assert r.status_code == 200
    assert r.json()["count"] > 0


def test_models_endpoint(client):
    r = client.get("/api/v1/models")
    assert r.status_code == 200
    assert r.json()["models"][0]["model_version"]

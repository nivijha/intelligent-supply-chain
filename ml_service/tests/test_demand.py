import pandas as pd

from ml_service.config import DATA_DIR
from ml_service.demand import train_demand_model, forecast_demand, load_artifact
from ml_service.config import DEMAND_MODEL_PATH


def test_train_and_forecast():
    history = pd.read_csv(DATA_DIR / "core" / "monthly_demand_history.csv")
    artifact = train_demand_model(history, test_months=3)
    assert artifact["model_version"]
    assert artifact["metrics"]["random_forest"]["mae"] >= 0
    forecast = forecast_demand(history, 2, artifact)
    assert len(forecast) == history[["district_id", "product_id"]].drop_duplicates().shape[0] * 2
    assert (forecast["predicted_demand_quintals"] >= 0).all()

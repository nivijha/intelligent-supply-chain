import pandas as pd

from ml_service.config import DATA_DIR
from ml_service.demand import feature_frame
from ml_service.shap_explain import explain_demand


def test_shap_output(model_artifact):
    history = pd.read_csv(DATA_DIR / "core" / "monthly_demand_history.csv")
    featured = feature_frame(history)
    explanations = explain_demand(featured.head(2), model_artifact, top_n=3)
    assert len(explanations) == 2
    assert explanations[0]["model_version"] == model_artifact["model_version"]
    assert len(explanations[0]["contributions"]) == 3

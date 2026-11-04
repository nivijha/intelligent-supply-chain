import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pandas as pd

from ml_service.config import DATA_DIR, DEMAND_MODEL_PATH
from ml_service.demand import train_demand_model, save_artifact

HISTORY_PATH = DATA_DIR / "core" / "monthly_demand_history.csv"


def main() -> None:
    history = pd.read_csv(HISTORY_PATH)
    artifact = train_demand_model(history, test_months=6)
    save_artifact(artifact, DEMAND_MODEL_PATH)
    print("Saved model:", DEMAND_MODEL_PATH)
    print("Version:", artifact["model_version"])
    print("Training period:", artifact["training_period"])
    print("Test period:", artifact["test_period"])
    print("Metrics:", artifact["metrics"])


if __name__ == "__main__":
    main()

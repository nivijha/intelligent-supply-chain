from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATA_DIR = PROJECT_ROOT / "public_supply_chain_synthetic" / "data"
DEFAULT_ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts"

DATA_DIR = Path(os.getenv("ML_DATA_DIR", str(DEFAULT_DATA_DIR)))
ARTIFACT_DIR = Path(os.getenv("ML_ARTIFACT_DIR", str(DEFAULT_ARTIFACT_DIR)))
DEMAND_MODEL_PATH = ARTIFACT_DIR / "demand_model.joblib"
DEMAND_MODEL_VERSION = "random-forest-demand-1.0.0"

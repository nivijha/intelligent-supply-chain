
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, Query

app = FastAPI(
    title="AI-Powered Public Supply Chain Platform",
    description=(
        "API for demand forecasting, inventory optimization, "
        "route recommendations, and ML evaluation results."
    ),
    version="1.0.0",
)

OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def load_csv(filename: str) -> pd.DataFrame:
    """Load an existing project output CSV."""
    path = OUTPUT_DIR / filename

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Output file not found: {filename}. "
                   "Run the corresponding Python script first."
        )

    return pd.read_csv(path)


@app.get("/")
def home():
    return {
        "project": "AI-Powered Public Supply Chain Platform",
        "status": "running",
        "available_endpoints": [
            "/health",
            "/demand/metrics",
            "/demand/predictions",
            "/demand/feature-importance",
            "/inventory/recommendations",
            "/routes/recommendations",
            "/routes/requiring-review",
            "/docs",
        ],
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/demand/metrics")
def demand_metrics():
    df = load_csv("model_metrics.csv")
    return df.to_dict(orient="records")


@app.get("/demand/predictions")
def demand_predictions(
    limit: int = Query(default=20, ge=1, le=500)
):
    df = load_csv("demand_predictions.csv")
    return {
        "count": len(df),
        "data": df.head(limit).to_dict(orient="records"),
    }


@app.get("/demand/feature-importance")
def demand_feature_importance():
    df = load_csv("feature_importance.csv")
    return df.head(15).to_dict(orient="records")


@app.get("/inventory/recommendations")
def inventory_recommendations(
    status: str | None = Query(
        default=None,
        pattern="^(REORDER|SUFFICIENT)$"
    ),
    limit: int = Query(default=100, ge=1, le=1000),
):
    df = load_csv("inventory_recommendations.csv")

    if status is not None:
        df = df[df["stock_status"] == status]

    return {
        "count": len(df),
        "data": df.head(limit).to_dict(orient="records"),
    }


@app.get("/routes/recommendations")
def route_recommendations(
    limit: int = Query(default=100, ge=1, le=1000)
):
    df = load_csv("route_recommendations.csv")
    return {
        "count": len(df),
        "data": df.head(limit).to_dict(orient="records"),
    }


@app.get("/routes/requiring-review")
def routes_requiring_review(
    limit: int = Query(default=100, ge=1, le=1000)
):
    df = load_csv("shipments_needing_review.csv")
    return {
        "count": len(df),
        "data": df.head(limit).to_dict(orient="records"),
    }

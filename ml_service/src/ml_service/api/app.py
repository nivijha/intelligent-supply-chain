from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from ..config import DATA_DIR, DEMAND_MODEL_PATH
from ..demand import forecast_demand, load_artifact
from ..features import (
    BASE_NUMERIC_FEATURES,
    CATEGORICAL_FEATURES,
    REQUIRED_HISTORY_COLUMNS,
    feature_frame,
)
from ..inventory import optimize_inventory
from ..routes import optimize_routes
from ..shap_explain import explain_demand
from .schemas import (
    ExplainRequest,
    ExplainResponse,
    ForecastRequest,
    ForecastResponse,
    HealthResponse,
    InventoryOptimizeRequest,
    MetricsResponse,
    ModelsResponse,
    RoutesOptimizeRequest,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.artifact = load_artifact(DEMAND_MODEL_PATH)
    except FileNotFoundError:
        app.state.artifact = None
    yield


app = FastAPI(
    title="Intelligent Supply Chain ML Service",
    version="1.0.0",
    lifespan=lifespan,
)


def _require_model():
    artifact = getattr(app.state, "artifact", None)
    if artifact is None:
        raise HTTPException(status_code=503, detail="Demand model artifact is not available")
    return artifact


def _prepare_explain_frame(frame: pd.DataFrame) -> pd.DataFrame:
    engineered_columns = set(CATEGORICAL_FEATURES + BASE_NUMERIC_FEATURES)
    if engineered_columns.issubset(frame.columns):
        return frame

    if REQUIRED_HISTORY_COLUMNS.issubset(frame.columns):
        featured = feature_frame(frame)
        if featured.empty:
            raise ValueError("Insufficient historical records to build explanation features")
        return featured

    missing = sorted(set(CATEGORICAL_FEATURES + BASE_NUMERIC_FEATURES) - set(frame.columns))
    raise ValueError(f"records are missing required fields: {missing}")


@app.get("/api/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    artifact = getattr(app.state, "artifact", None)
    return HealthResponse(
        status="healthy",
        service="ml-service",
        model_loaded=artifact is not None,
        model_version=artifact["model_version"] if artifact else None,
    )


@app.get("/api/v1/health/live", response_model=HealthResponse)
def health_live() -> HealthResponse:
    return HealthResponse(status="healthy", service="ml-service", model_loaded=True, model_version=None)


@app.get("/api/v1/health/ready", response_model=HealthResponse)
def health_ready() -> HealthResponse:
    artifact = getattr(app.state, "artifact", None)
    if artifact is None:
        raise HTTPException(status_code=503, detail="Demand model artifact is not available")
    return HealthResponse(
        status="healthy",
        service="ml-service",
        model_loaded=True,
        model_version=artifact["model_version"],
    )


@app.get("/api/v1/models", response_model=ModelsResponse)
def models() -> ModelsResponse:
    artifact = getattr(app.state, "artifact", None)
    return ModelsResponse(
        models=[
            {
                "model_version": artifact["model_version"] if artifact else "unavailable",
                "artifact_path": str(DEMAND_MODEL_PATH),
                "metrics": artifact.get("metrics") if artifact else None,
            }
        ]
    )


@app.get("/api/v1/demand/metrics", response_model=MetricsResponse)
def demand_metrics() -> MetricsResponse:
    artifact = _require_model()
    return MetricsResponse(model_version=artifact["model_version"], metrics=artifact["metrics"])


@app.post("/api/v1/demand/forecast", response_model=ForecastResponse)
def demand_forecast(request: ForecastRequest) -> ForecastResponse:
    artifact = _require_model()
    if request.history is not None:
        history = pd.DataFrame(request.history)
    else:
        history = pd.read_csv(DATA_DIR / "core" / "monthly_demand_history.csv")

    if request.district_id:
        history = history[history["district_id"] == request.district_id]
    if request.product_id:
        history = history[history["product_id"] == request.product_id]
    if history.empty:
        raise HTTPException(status_code=400, detail="No history available for the requested filters")

    try:
        forecast = forecast_demand(history, request.horizon, artifact)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    records = forecast.to_dict(orient="records")
    return ForecastResponse(
        model_version=artifact["model_version"],
        horizon=request.horizon,
        count=len(records),
        data=records,
    )


@app.post("/api/v1/demand/explain", response_model=ExplainResponse)
def demand_explain(request: ExplainRequest) -> ExplainResponse:
    artifact = _require_model()
    frame = pd.DataFrame(request.records)
    if frame.empty:
        raise HTTPException(status_code=400, detail="records must not be empty")
    try:
        frame = _prepare_explain_frame(frame)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    explanations = explain_demand(frame, artifact, top_n=request.top_n)
    return ExplainResponse(count=len(explanations), data=explanations)


@app.post("/api/v1/inventory/optimize")
def inventory_optimize(request: InventoryOptimizeRequest):
    try:
        inventory = pd.DataFrame(request.inventory)
        forecast = pd.DataFrame(request.forecast)
        warehouse_districts = (
            pd.DataFrame(request.warehouse_districts) if request.warehouse_districts else None
        )
        warehouses = pd.DataFrame(request.warehouses) if request.warehouses else None
        incoming = pd.DataFrame(request.incoming) if request.incoming else None
        result = optimize_inventory(
            inventory,
            forecast,
            warehouse_districts=warehouse_districts,
            warehouses=warehouses,
            incoming=incoming,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    records = result.where(result.notna(), None).to_dict(orient="records")
    return JSONResponse({"count": len(result), "data": records})


@app.post("/api/v1/routes/optimize")
def routes_optimize(request: RoutesOptimizeRequest):
    try:
        candidates = pd.DataFrame(request.candidates)
        vehicles = pd.DataFrame(request.vehicles) if request.vehicles else None
        inventory = pd.DataFrame(request.inventory) if request.inventory else None
        result = optimize_routes(candidates, vehicles, inventory)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return JSONResponse(
        {
            "summary": result["summary"],
            "recommendations": result["recommendations"].where(result["recommendations"].notna(), None).to_dict(orient="records"),
            "unserved": result["unserved"].where(result["unserved"].notna(), None).to_dict(orient="records"),
        }
    )

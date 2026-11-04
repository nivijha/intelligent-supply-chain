from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    model_version: str | None = None


class ForecastRequest(BaseModel):
    horizon: int = Field(default=3, ge=1, le=12)
    history: list[dict[str, Any]] | None = None
    district_id: str | None = None
    product_id: str | None = None


class ForecastRecord(BaseModel):
    forecast_month: str
    district_id: str
    product_id: str
    predicted_demand_quintals: float
    model_version: str


class ForecastResponse(BaseModel):
    model_version: str
    horizon: int
    count: int
    data: list[ForecastRecord]


class ExplainRequest(BaseModel):
    records: list[dict[str, Any]]
    top_n: int = Field(default=10, ge=1, le=50)


class Contribution(BaseModel):
    feature: str
    contribution: float
    direction: str


class Explanation(BaseModel):
    model_version: str
    base_value: float
    prediction: float
    contributions: list[Contribution]


class ExplainResponse(BaseModel):
    count: int
    data: list[Explanation]


class MetricsResponse(BaseModel):
    model_version: str
    metrics: dict[str, Any]


class InventoryOptimizeRequest(BaseModel):
    inventory: list[dict[str, Any]]
    forecast: list[dict[str, Any]]
    warehouse_districts: list[dict[str, Any]] | None = None
    warehouses: list[dict[str, Any]] | None = None
    incoming: list[dict[str, Any]] | None = None


class RoutesOptimizeRequest(BaseModel):
    candidates: list[dict[str, Any]]
    vehicles: list[dict[str, Any]] | None = None
    inventory: list[dict[str, Any]] | None = None


class ModelInfo(BaseModel):
    model_version: str
    artifact_path: str
    metrics: dict[str, Any] | None = None


class ModelsResponse(BaseModel):
    models: list[ModelInfo]

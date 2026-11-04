CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
    district_id VARCHAR(20) PRIMARY KEY,
    district_name VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    population_estimate BIGINT,
    rural_share NUMERIC(6,4),
    road_access_score NUMERIC(6,4),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6)
);

CREATE TABLE IF NOT EXISTS products (
    product_id VARCHAR(40) PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    priority_weight NUMERIC(6,4),
    demand_volatility NUMERIC(6,4),
    shelf_life_days INTEGER,
    storage_type VARCHAR(40)
);

CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id VARCHAR(20) PRIMARY KEY,
    warehouse_name VARCHAR(120) NOT NULL,
    location_district_id VARCHAR(20) REFERENCES districts(district_id),
    state VARCHAR(120),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    capacity_quintals NUMERIC(14,2),
    handling_capacity_quintals_day NUMERIC(14,2),
    storage_cost_per_quintal_month_inr NUMERIC(14,4),
    operating_cost_per_day_inr NUMERIC(14,4),
    reliability_score NUMERIC(6,4)
);

CREATE TABLE IF NOT EXISTS warehouse_districts (
    warehouse_id VARCHAR(20) NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    district_id VARCHAR(20) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    PRIMARY KEY (warehouse_id, district_id)
);

CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id VARCHAR(20) PRIMARY KEY,
    vehicle_type VARCHAR(60) NOT NULL,
    capacity_quintals NUMERIC(14,2) NOT NULL,
    fixed_cost_inr NUMERIC(14,4),
    cost_per_km_inr NUMERIC(14,4),
    average_speed_kmph NUMERIC(10,2),
    fuel_efficiency_kmpl NUMERIC(10,4),
    availability_flag BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS historical_demand (
    id BIGSERIAL PRIMARY KEY,
    district_id VARCHAR(20) NOT NULL REFERENCES districts(district_id),
    product_id VARCHAR(40) NOT NULL REFERENCES products(product_id),
    month DATE NOT NULL,
    demand_quintals NUMERIC(14,2) NOT NULL,
    population_estimate BIGINT,
    festival_season_flag BOOLEAN NOT NULL DEFAULT FALSE,
    shortage_event_flag BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (district_id, product_id, month)
);

CREATE INDEX IF NOT EXISTS idx_historical_demand_lookup
    ON historical_demand (district_id, product_id, month);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id VARCHAR(20) NOT NULL REFERENCES warehouses(warehouse_id),
    product_id VARCHAR(40) NOT NULL REFERENCES products(product_id),
    snapshot_date DATE NOT NULL,
    on_hand_quintals NUMERIC(14,2) NOT NULL,
    reserved_quintals NUMERIC(14,2) NOT NULL DEFAULT 0,
    incoming_quintals NUMERIC(14,2) NOT NULL DEFAULT 0,
    reorder_lead_time_days INTEGER NOT NULL,
    safety_stock_quintals NUMERIC(14,2) NOT NULL DEFAULT 0,
    unit_procurement_cost_inr NUMERIC(14,4),
    expiry_risk_score NUMERIC(6,4),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_id, product_id)
);

CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id VARCHAR(20) NOT NULL REFERENCES districts(district_id),
    product_id VARCHAR(40) NOT NULL REFERENCES products(product_id),
    forecast_month DATE NOT NULL,
    predicted_demand_quintals NUMERIC(14,2) NOT NULL,
    model_version VARCHAR(120) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (district_id, product_id, forecast_month, model_version)
);

CREATE TABLE IF NOT EXISTS shipments (
    shipment_id VARCHAR(40) PRIMARY KEY,
    order_date DATE,
    warehouse_id VARCHAR(20) NOT NULL REFERENCES warehouses(warehouse_id),
    district_id VARCHAR(20) NOT NULL REFERENCES districts(district_id),
    product_id VARCHAR(40) NOT NULL REFERENCES products(product_id),
    quantity_quintals NUMERIC(14,2) NOT NULL,
    vehicle_id VARCHAR(20) REFERENCES vehicles(vehicle_id),
    distance_km NUMERIC(14,4),
    travel_time_hours NUMERIC(14,4),
    transport_cost_inr NUMERIC(14,4),
    on_time_delivery_flag BOOLEAN,
    warehouse_stock_at_order NUMERIC(14,2),
    status VARCHAR(40) NOT NULL DEFAULT 'PLANNED',
    recommendation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_type VARCHAR(60) NOT NULL,
    district_id VARCHAR(20) REFERENCES districts(district_id),
    product_id VARCHAR(40) REFERENCES products(product_id),
    warehouse_id VARCHAR(20) REFERENCES warehouses(warehouse_id),
    from_warehouse_id VARCHAR(20) REFERENCES warehouses(warehouse_id),
    to_warehouse_id VARCHAR(20) REFERENCES warehouses(warehouse_id),
    quantity_quintals NUMERIC(14,2),
    estimated_cost_inr NUMERIC(14,4),
    justification TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED')),
    model_version VARCHAR(120),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

ALTER TABLE shipments
    ADD CONSTRAINT fk_shipments_recommendation
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(id);

CREATE TABLE IF NOT EXISTS recommendation_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(120) NOT NULL,
    version VARCHAR(120) NOT NULL,
    artifact_path TEXT,
    metrics JSONB,
    trained_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (model_name, version)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    source TEXT,
    document_type VARCHAR(80),
    upload_date DATE,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_lookup ON forecasts (district_id, product_id, forecast_month);
CREATE INDEX IF NOT EXISTS idx_inventory_lookup ON inventory (warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations (status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at);

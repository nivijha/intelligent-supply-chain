CREATE TABLE IF NOT EXISTS route_candidates (
    candidate_id VARCHAR(60) PRIMARY KEY,
    shipment_id VARCHAR(40) NOT NULL,
    warehouse_id VARCHAR(20) NOT NULL REFERENCES warehouses(warehouse_id),
    district_id VARCHAR(20) NOT NULL REFERENCES districts(district_id),
    product_id VARCHAR(40) NOT NULL REFERENCES products(product_id),
    quantity_quintals NUMERIC(14,2) NOT NULL,
    vehicle_id VARCHAR(20) REFERENCES vehicles(vehicle_id),
    distance_km_simulated NUMERIC(14,4),
    estimated_time_hours_simulated NUMERIC(14,4),
    estimated_cost_inr_simulated NUMERIC(14,4),
    available_stock_quintals NUMERIC(14,2),
    stock_shortfall_quintals NUMERIC(14,2),
    vehicle_capacity_quintals NUMERIC(14,2),
    capacity_violation_quintals NUMERIC(14,2),
    objective_score_proxy NUMERIC(14,4),
    recommended_candidate_label_simulated INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_route_candidates_shipment ON route_candidates (shipment_id);

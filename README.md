# AI-Powered Public Supply Chain Intelligence Platform

A full-stack decision-support platform for public distribution and supply-chain management. It combines machine-learning demand forecasting, inventory optimization, logistics route allocation, and human-in-the-loop recommendation approvals, with role-based access control and audit logging.

Built as a final-year engineering project, the platform is implemented as three decoupled services:

- **Frontend** — React 19 + Vite dashboard
- **Backend** — Node.js + Express API with PostgreSQL
- **ML Service** — Python FastAPI service with scikit-learn and SHAP

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Machine Learning Methodology](#machine-learning-methodology)
- [Inventory Optimization](#inventory-optimization)
- [Logistics Optimization](#logistics-optimization)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Installation and Local Setup](#installation-and-local-setup)
- [Dataset Initialization and Data Management](#dataset-initialization-and-data-management)
- [API Documentation](#api-documentation)
- [Authentication and Security](#authentication-and-security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Limitations and Future Scope](#limitations-and-future-scope)
- [Screenshots](#screenshots)
- [License and Acknowledgements](#license-and-acknowledgements)

---

## Project Overview

### Problem

Public distribution and supply-chain operations in the public sector are typically fragmented across warehouses, districts, and planning teams. Common pain points include:

- Demand planning based on historical averages rather than data-driven forecasts.
- Stock-outs and overstocking caused by manual reorder decisions.
- No explainability for replenishment or routing recommendations, reducing planner trust.
- Recommendations executed without an approval trail or access control.

### Solution

The AI-Powered Public Supply Chain Intelligence Platform addresses these problems by providing:

1. **Demand forecasting** — a Random Forest model predicts monthly demand per district and product.
2. **Inventory optimization** — computes reorder points, safety stock, and recommended procurement quantities with warehouse-capacity constraints.
3. **Logistics optimization** — allocates shipments to feasible routes subject to vehicle capacity and stock availability.
4. **Explainable AI** — SHAP-based feature contributions explain every demand forecast.
5. **Human-in-the-loop** — all replenishment recommendations must be approved or rejected by an authorized user before execution.
6. **Role-based access control** — JWT authentication with four roles (Admin, Planner, Warehouse Manager, Analyst).
7. **Audit logging** — every significant action is recorded with user, action, entity, timestamp, and IP address.

### Intended users

- **Planners** — generate forecasts, inventory recommendations, and route plans.
- **Warehouse Managers** — review inventory, approve/reject recommendations, and create shipments.
- **Analysts** — view dashboards, forecasts, inventory, and audit logs.
- **Administrators** — manage users and roles.

---

## Key Features

The table below distinguishes **implemented** features from **planned** enhancements and **reserved** infrastructure (present in the schema but not wired into application code).

| Feature | Status | Description |
|---|---|---|
| Demand forecasting | Implemented | Random Forest regression forecasting monthly demand per district/product, with recursive multi-horizon prediction. |
| Seasonal-naive baseline | Implemented | Lag-12 seasonal-naive comparator evaluated alongside Random Forest using MAE/RMSE/MAPE. |
| SHAP explainability | Implemented | TreeExplainer SHAP contributions per forecast instance, surfaced via `/api/demand/explain`. |
| Inventory optimization | Implemented | Forecast-driven reorder point, safety stock, lead-time demand, and capacity-constrained procurement quantity. |
| Warehouse management | Implemented | CRUD-style listing and detail views for warehouses and districts. |
| Product and district reference data | Implemented | Read-only listing of products and districts from the database. |
| Logistics / route optimization | Implemented | Feasible-route selection subject to vehicle capacity, stock availability, and simulated cost/time. |
| Shipment creation | Implemented | Create shipment records linked to warehouses, districts, products, and vehicles. |
| Recommendation generation | Implemented | Generates replenishment recommendations (`PENDING`) from inventory optimization output. |
| Human-in-the-loop approval | Implemented | Approve/reject recommendations with state transition guard (PENDING only), reviewer timestamp, and reason. |
| Role-based access control | Implemented | JWT auth with four roles; route-level authorization via `requireRoles`. |
| Dashboard analytics | Implemented | Counts of inventory items, pending recommendations, shipments, and warehouses. |
| Audit logging | Implemented | Append-only `audit_logs` table; written for login, forecasts, optimization, recommendations, and shipments. |
| Password hashing | Implemented | bcrypt (cost 10) via `bcryptjs`. |
| Input validation | Implemented | Zod schemas on all mutating endpoints. |
| CSV dataset seeding | Implemented | Developer-operated `seed_from_csv.py` initializes PostgreSQL from synthetic CSVs. |
| RAG / vector search | Not implemented | `documents`, `document_chunks`, and `pgvector` are reserved in `001_initial_schema.sql` but no application code or API routes use them. |
| User-facing CSV/Excel upload | Not implemented | No frontend or backend endpoint accepts file uploads. Seeding is a developer-run CLI process only. |
| Live road-network routing | Not implemented | All distances, travel times, and costs are `*_simulated` columns; no Google Maps or live road-network integration. |
| Automated data ingestion | Not implemented | Data enters only via the CSV seed script; no scheduled or API-driven ingestion pipeline. |
| Model retraining / monitoring | Not implemented | Model artifact is trained once via `train_demand.py`; no retraining scheduler or drift monitoring. |

---

## Architecture

The system follows a three-service separation. The frontend talks only to the backend; the backend talks to PostgreSQL and proxies ML requests to the Python service.

```
                      ┌─────────────────────────────────────┐
                      │           End User / Browser        │
                      └──────────────────────┬──────────────┘
                                             │ HTTP (Vite proxy /api)
                      ┌──────────────────────▼──────────────┐
                      │       React + Vite Frontend         │
                      │  (Dashboard, Inventory, Forecast,   │
                      │   Recommendations, Approvals, …)   │
                      └──────────────────────┬──────────────┘
                                             │ REST /api/*
                      ┌──────────────────────▼──────────────┐
                      │    Node.js + Express Backend        │
                      │  Auth, RBAC, audit, repositories    │
                      └──────────────────────┬──────────────┘
                     ┌─┴─┐                          ┌─┴─┐
                     │   │                          │   │
              ┌──────┘   └──────┐          ┌───────┘   └───────┐
              │                 │          │                   │
     ┌────────▼────────┐  ┌─────▼──────┐ ┌─▼─────────────────────┐
     │   PostgreSQL    │  │  ML Client │ │   Python FastAPI ML   │
     │  (pg, pgcrypto, │  │ (axios)    │ │   Service (port 8000) │
     │   pgvector)     │  │            │ │  • Random Forest      │
     └─────────────────┘  └────────────┘ │  • SHAP explainability│
                                        │  • Inventory optimize │
                                        │  • Route optimization │
                                        └───────────────────────┘
```

### Mermaid architecture diagram

```mermaid
graph TD
    subgraph Client
        UI[React + Vite Frontend<br/>localhost:5173]
    end

    subgraph Backend["Backend API (Node.js + Express)<br/>localhost:3001"]
        AUTH[Auth & JWT]
        RBAC[Role-Based Access Control]
        API[REST Routes /api/*]
        AUDIT[Audit Logging Service]
        MLCLIENT[ML HTTP Client<br/>axios]
    end

    subgraph DB[(PostgreSQL<br/>pgcrypto + pgvector<br/>localhost:5433)]
        TBL[18 tables:<br/>users, roles, districts,<br/>products, warehouses, inventory,<br/>historical_demand, forecasts,<br/>shipments, recommendations,<br/>route_candidates, audit_logs, …]
    end

    subgraph ML["ML Service (Python FastAPI)<br/>localhost:8000"]
        RF[Random Forest Regressor<br/>demand_forecast]
        SHAP[SHAP TreeExplainer<br/>explainability]
        INV[Inventory Optimization]
        RT[Route Optimization]
    end

    UI -->|HTTP /api (Vite proxy)| API
    API --> AUTH
    API --> RBAC
    API --> AUDIT
    API -->|forecast / explain /<br/>optimize-inventory / optimize-routes| MLCLIENT
    MLCLIENT -->|HTTP /api/v1/*| RF
    MLCLIENT --> SHAP
    MLCLIENT --> INV
    MLCLIENT --> RT
    API -->|SQL via pg pool| TBL
    RF -.->|reads/writes artifacts| DB
```

### Mermaid data-flow diagram

```mermaid
flowchart LR
    subgraph FE[Frontend]
        U1[User action] --> R1[HTTP request /api/*]
    end

    subgraph BE[Backend]
        R1 --> V1[Zod validation]
        V1 --> A1[Authenticate / RBAC]
        A1 --> Q1[Repository query]
        Q1 --> PG[(PostgreSQL)]
        PG --> Q1
        A1 --> M1[Proxy to ML service]
    end

    subgraph ML[ML Service]
        M1 --> F1[Random Forest forecast]
        F1 --> S1[SHAP explain]
        F1 --> I1[Inventory optimization]
        F1 --> R1b[Route optimization]
    end

    I1 --> O1[Recommendations PENDING]
    R1b --> O2[Feasible / Unserved shipments]

    Q1 --> R2[JSON response]
    M1 --> R2
    R2 --> U2[Render in UI]
```

### Reasoning behind the architecture

- **Service separation** keeps the Python ML stack (scikit-learn, SHAP, pandas) out of the Node.js request path, allowing each service to be scaled and deployed independently.
- **Backend-as-proxy** means the browser never calls the ML service directly, keeping `ML_SERVICE_URL` configurable and avoiding CORS between frontend and ML.
- **PostgreSQL as the single source of truth** for reference data, inventory, forecasts, recommendations, shipments, and audit logs.
- **Explicit SSL configuration** (`DB_SSL`) rather than inferring SSL from `NODE_ENV`, so local Docker PostgreSQL and hosted providers (e.g. Neon) can both be supported.

---

## Technology Stack

Only technologies genuinely used in the source code are listed.

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router DOM 7, Axios, Recharts, Lucide React, Vitest, oxlint, jsdom |
| Backend | Node.js, Express 4, `pg` (PostgreSQL client), `bcryptjs`, `jsonwebtoken`, `zod`, `cors`, `helmet`, `morgan`, `dotenv`, Node `node:test` |
| Database | PostgreSQL, `pgcrypto`, `pgvector` (reserved, unused by application code) |
| Machine Learning | Python, FastAPI, scikit-learn (RandomForestRegressor), pandas, numpy, joblib, SHAP, Uvicorn, pytest |
| Data Processing | pandas (feature engineering, lag/rolling features, inventory/route optimization) |
| Authentication & Security | JWT (8h default expiry), bcrypt password hashing, role-based access control, Helmet headers, CORS with origin allowlist, request body size limit |
| Deployment & DevOps | Docker, Docker Compose, `psycopg` (seed script) |
| Testing | Vitest (frontend), Node `node:test` (backend), pytest (ML service) |

---

## Machine Learning Methodology

### Dataset

The data is **synthetic**, generated by scripts in `public_supply_chain_synthetic/` (e.g. `01_generate_core_data.py`, `02_generate_logistics_data.py`). CSV files live in `public_supply_chain_synthetic/data/core/` and `public_supply_chain_synthetic/data/logistics/`. This is **not** real government or public-distribution data.

Core datasets:
- `districts.csv`, `products.csv`, `warehouses.csv`
- `monthly_demand_history.csv` — monthly demand history with `district_id`, `product_id`, `month`, `demand_quintals`, `population_estimate`, `festival_season_flag`, `shortage_event_flag`
- `inventory_snapshot.csv` — current stock per warehouse/product

Logistics datasets:
- `vehicle_fleet.csv`, `historical_shipments.csv`, `route_allocation_candidates.csv`, `warehouse_utilization.csv`

Note: `procurement_orders.csv` and `warehouse_utilization.csv` exist in `data/core/` / `data/logistics/` but are **not** imported by `seed_from_csv.py`.

### Preprocessing and feature engineering

Implemented in `ml_service/src/ml_service/features.py`:

- `prepare_history` validates required columns (`month`, `district_id`, `product_id`, `demand_quintals`, `population_estimate`, `festival_season_flag`, `shortage_event_flag`) and rejects duplicate district/product/month rows.
- `add_lag_features` builds, per district/product group, without temporal leakage:
  - `lag_1`, `lag_3`, `lag_12` — prior-month demand at 1, 3, and 12 months
  - `rolling_mean_3` — 3-month rolling mean of the previous month's demand
  - `month_sin`, `month_cos` — cyclic encoding of month number
- `feature_frame` drops rows missing any lag feature (required for a chronological split).
- `encode_features` one-hot encodes `district_id` and `product_id` and aligns columns to the stored training feature list.

### Model

- **Algorithm**: `sklearn.ensemble.RandomForestRegressor` with `n_estimators=300`, `max_depth=10`, `min_samples_leaf=3`, `random_state=42`, `n_jobs=-1`.
- **Baseline**: seasonal-naive using `lag_12` (demand from 12 months prior).
- **Training**: `scripts/train_demand.py` reads `monthly_demand_history.csv`, trains the model, and saves a joblib artifact to `ml_service/artifacts/demand_model.joblib`.
- **Model version**: `random-forest-demand-1.0.0`.

### Evaluation

- **Split**: chronological train/test split (`chronological_split`, default `test_months=6`) — train on earlier months, test on the most recent 6 months, preserving temporal order.
- **Metrics**: MAE, RMSE, MAPE, computed for both Random Forest and the seasonal-naive baseline in `demand.py:_metrics`.
- MAPE uses `np.nanmean` and treats zero actuals as NaN to avoid division by zero.
- Metrics are stored in the model artifact and exposed via `GET /api/v1/demand/metrics` and proxied through `GET /api/demand/metrics`.

> No numeric model performance figures are published in this README because they depend on the training data and have not been independently verified at documentation time. To reproduce evaluation, run `python scripts/train_demand.py` (see Installation) or `pytest` in `ml_service/`, then inspect `ml_service/artifacts/demand_model.joblib` or the `/api/v1/demand/metrics` endpoint.

### Forecasting

`forecast_demand` performs recursive multi-step prediction:
- For each future month, features are built from previously predicted demand (lag features updated as predictions are made).
- `festival_season_flag` is derived from the target month (October/November = 1).
- `shortage_event_flag` is assumed to be 0 for future months (no reliable future event source).
- Requires at least 12 months of history per district/product group.

### Explainability

`shap_explain.explain_demand` uses `shap.TreeExplainer` on the Random Forest model and returns, per instance, the base value, prediction, and top-N feature contributions ranked by absolute magnitude, each labeled "increases" or "decreases".

---

## Inventory Optimization

Business logic is implemented in `ml_service/src/ml_service/inventory.py` and invoked by the backend through `POST /api/inventory/optimize` and `POST /api/recommendations/generate`.

### Formulas (verified against implementation)

Let:

- `on_hand` = stock physically present
- `reserved` = stock already allocated
- `incoming` = stock on order / in transit
- `lead_time_days` = supplier reorder lead time in days
- `safety_stock` = buffer stock in quintals
- `avg_daily_demand` = forecast average monthly demand / 30

**Available stock**
```
available_stock = max(on_hand - reserved + incoming, 0)
```

**Lead-time demand**
```
lead_time_demand = avg_daily_demand * lead_time_days
```

**Reorder point**
```
reorder_point = lead_time_demand + safety_stock
```

**Shortage and recommended order**
```
shortage = max(reorder_point - available_stock, 0)
recommended_order = ceil(shortage)
```

**Capacity constraint** (when warehouse capacity is known)
```
remaining_capacity = max(capacity - on_hand, 0)
capacity_constrained = recommended_order > remaining_capacity
recommended_order = min(recommended_order, remaining_capacity)
```

**Estimated cost**
```
estimated_order_cost = recommended_order * unit_procurement_cost
```

**Stock status**
- `REORDER` if `available_stock <= reorder_point`
- `SUFFICIENT` otherwise

**Risk level**
- `CRITICAL` if `available_stock <= 0`
- `LOW` if `0 < available_stock <= reorder_point`
- `OVERSTOCK` if `available_stock > 2 * lead_time_demand`
- `NORMAL` otherwise

Only rows with `stock_status = REORDER` are converted into `PENDING` replenishment recommendations by the backend (`recommendations.routes.js`).

---

## Logistics Optimization

Implemented in `ml_service/src/ml_service/routes.py` and exposed by `POST /api/logistics/routes/optimize` and `POST /api/routes/optimize`.

### Process

1. Route candidates are loaded from the `route_candidates` table (optionally filtered by shipment IDs).
2. Each candidate is checked for feasibility:
   - **Vehicle capacity**: `quantity <= vehicle_capacity`
   - **Stock availability**: `quantity <= available_stock`
   - **Route capacity**: `capacity_violation_quintals <= 0`
   - **Vehicle availability**: `availability_flag == true`
   - **Stock known**: available stock is non-null
   - **Cost known**: `estimated_cost_inr_simulated` is non-null
3. Feasible candidates are sorted by `shipment_id`, then simulated cost, then simulated time; one recommendation per shipment is kept with status `FEASIBLE_LOWEST_COST`.
4. Shipments with no feasible candidate are listed as `unserved` with status `NO_FEASIBLE_CANDIDATE`.
5. A summary reports total shipments, feasible shipments, shipments needing review, plus aggregated simulated cost and distance.

### Important disclosure

All distance, travel-time, and cost fields are **simulated** (columns named `*_simulated`, e.g. `distance_km_simulated`, `estimated_cost_inr_simulated`). They are **not** obtained from live road-network routing, Google Maps, or any external GIS API. Do not describe this as live routing.

---

## Database Design

PostgreSQL schema is defined in two migrations:

- `database/migrations/001_initial_schema.sql` — core schema (18 tables)
- `database/migrations/002_route_candidates.sql` — `route_candidates` table

Extensions enabled: `pgcrypto`, `pgvector` (the latter reserved for future RAG use; not used by application code).

### Mermaid ER diagram

```mermaid
erDiagram
    roles ||--o{ users : contains
    users ||--o{ audit_logs : creates
    users ||--o{ recommendations : creates
    users ||--o{ recommendations : reviews
    users ||--o{ recommendation_approvals : decides
    users ||--o{ forecasts : creates
    users ||--o{ documents : uploads

    districts ||--o{ warehouses : located_in
    districts ||--o{ historical_demand : records
    districts ||--o{ forecasts : predicts
    districts ||--o{ shipments : delivers_to
    districts ||--o{ route_candidates : destination
    districts }o--|| warehouse_districts : maps

    products ||--o{ historical_demand : records
    products ||--o{ forecasts : predicts
    products ||--o{ shipments : ships
    products ||--o{ recommendations : concerns
    products ||--o{ route_candidates : transports

    warehouses ||--o{ inventory : holds
    warehouses ||--o{ historical_demand : context
    warehouses ||--o{ shipments : ships_from
    warehouses ||--o{ route_candidates : originates
    warehouses ||--o{ warehouse_districts : maps

    vehicles ||--o{ shipments : assigned
    vehicles ||--o{ route_candidates : assigned

    inventory ||--o{ route_candidates : stock_source

    historical_demand ||--o{ forecasts : informs

    recommendations ||--o{ shipments : linked_via_recommendation_id
    recommendations ||--o{ recommendation_approvals : decisions

    audit_logs }o--|| users : by_user
    document_chunks }o--|| documents : contains
```

### Important entities and constraints

| Table | Key fields | Notes |
|---|---|---|
| `roles` | `id`, `name` | ADMIN, PLANNER, WAREHOUSE_MANAGER, ANALYST |
| `users` | `id` (UUID), `email` (unique), `password_hash`, `role_id` → `roles` | bcrypt-hashed passwords |
| `districts` | `district_id` (PK), `district_name`, `state`, coordinates | Reference data |
| `products` | `product_id` (PK), `product_name`, `unit`, shelf life | Reference data |
| `warehouses` | `warehouse_id` (PK), `capacity_quintals`, location | References `districts` |
| `warehouse_districts` | composite PK (`warehouse_id`, `district_id`) | Many-to-many service mapping |
| `vehicles` | `vehicle_id` (PK), `capacity_quintals`, `availability_flag` | Fleet reference |
| `historical_demand` | `district_id`, `product_id`, `month` (unique together) | Demand history |
| `inventory` | `warehouse_id`, `product_id` (unique together) | Current stock snapshot |
| `forecasts` | `district_id`, `product_id`, `forecast_month`, `model_version` | ML output |
| `shipments` | `shipment_id` (PK), `recommendation_id` → `recommendations` | Logistics records |
| `recommendations` | `id` (UUID), `status` CHECK (PENDING/APPROVED/REJECTED/EXECUTED/EXPIRED) | Human-in-the-loop |
| `recommendation_approvals` | `recommendation_id`, `user_id`, `decision` | Approval audit |
| `route_candidates` | `candidate_id` (PK), `*_simulated` fields | Logistics candidates |
| `model_versions` | `model_name`, `version`, `metrics` JSONB | Model registry |
| `audit_logs` | `user_id`, `action`, `entity_type`, `entity_id`, `metadata` JSONB, `ip_address` | Append-only audit |
| `documents`, `document_chunks` | Reserved for RAG | Not used by application code |

Indexes exist on `historical_demand(district_id, product_id, month)`, `inventory(warehouse_id, product_id)`, `forecasts(district_id, product_id, forecast_month)`, `recommendations(status, created_at)`, `audit_logs(created_at)`, and `route_candidates(shipment_id)`.

---

## Project Structure

```
intelligent-supply-chain/
├── README.md
├── docker-compose.yml                # Local multi-service orchestration
├── docker-compose.prod.yml           # Production override (secrets required)
├── .env.example                      # Root environment variable template
├── .gitignore
├── .dockerignore
├── AUDIT_REPORT.md
├── seed.diff
├── backend/                          # Node.js + Express API
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.example
│   ├── scripts/
│   │   ├── seedUsers.js
│   │   └── seedDemoUsers.js
│   ├── src/
│   │   ├── index.js                  # App entry, routes, health, error handling
│   │   ├── config.js                 # Env parsing (DB_SSL, CORS origins, etc.)
│   │   ├── db/pool.js                # pg Pool, SSL handling
│   │   ├── routes/*.routes.js        # auth, demand, inventory, warehouses, etc.
│   │   ├── repositories/*.js         # SQL access layer
│   │   ├── services/                 # mlClient.js, auditService.js
│   │   ├── middleware/               # auth.js, rbac.js, validate.js
│   │   ├── utils/jwt.js
│   │   └── validators/auth.js
│   └── tests/                        # node:test integration + unit tests
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_route_candidates.sql
│   └── seeds/
│       ├── seed_from_csv.py          # CSV → PostgreSQL initializer
│       └── seed_route_candidates.py
├── ml_service/                       # Python FastAPI ML service
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── scripts/train_demand.py
│   ├── src/ml_service/
│   │   ├── config.py
│   │   ├── demand.py                 # Random Forest, chronological split, forecast
│   │   ├── features.py               # Lag/rolling features, encoding
│   │   ├── inventory.py              # Reorder-point optimization
│   │   ├── routes.py                 # Route feasibility optimization
│   │   ├── shap_explain.py           # SHAP explanations
│   │   └── api/
│   │       ├── app.py                # FastAPI app + /api/v1 routes
│   │       └── schemas.py            # Pydantic schemas
│   ├── artifacts/                    # trained model joblib (gitignored)
│   └── tests/                        # pytest suite
├── frontend/                         # React + Vite dashboard
│   ├── package.json
│   ├── vite.config.js                # /api proxy → localhost:3001
│   ├── vitest.config.js
│   ├── src/
│   │   ├── App.jsx                   # Routing + role guards
│   │   ├── main.jsx
│   │   ├── contexts/AuthContext.jsx
│   │   ├── services/api.js           # Axios client + auth interceptor
│   │   ├── services/*.js             # dashboard, forecast, inventory, etc.
│   │   ├── components/               # UI components
│   │   ├── pages/                    # Login, Dashboard, Inventory, Forecast, …
│   │   └── test/                     # Vitest page/smoke tests
│   └── public/
└── public_supply_chain_synthetic/    # Synthetic data generator + CSVs
    ├── data/
    │   ├── core/                     # districts, products, warehouses, …
    │   └── logistics/                # shipments, vehicles, route candidates
    ├── 01_generate_core_data.py
    ├── 02_generate_logistics_data.py
    └── outputs/                      # model artifacts, plots, CSVs (gitignored)
```

Generated/ignored artifacts (`node_modules/`, `.venv/`, `ml_service/artifacts/`, `frontend/dist/`, `public_supply_chain_synthetic/outputs/`, `.env`) are excluded via `.gitignore` and `.dockerignore`.

---

## Installation and Local Setup

These commands are copied from the repository's package scripts and configuration files.

### Prerequisites

- Node.js 20+ (backend uses `node:test`, frontend uses Vite)
- Python 3.12+ and `pip` (ML service)
- PostgreSQL 16+ (locally or via Docker)
- `psycopg` Python package (for the seed script)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nivijha/intelligent-supply-chain.git
cd intelligent-supply-chain
```

### 2. Start PostgreSQL

The easiest local option is Docker Compose, which also starts the backend and ML service images:

```bash
docker compose up -d postgres
```

PostgreSQL is exposed on host port **5433** (mapped to container 5432), database `intelligent_supply_chain`, user `isc`. Migrations in `database/migrations/` run automatically on container startup via `/docker-entrypoint-initdb.d`.

If you run PostgreSQL outside Docker, create a database and user, then set `DATABASE_URL` accordingly.

### 3. Backend setup

```bash
cd backend
cp .env.example .env        # edit values for your local environment
npm install
```

`backend/.env.example` defines (do not commit real secrets):

```
PORT=3001
DATABASE_URL=postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=8h
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
```

Required environment variables (enforced by `backend/src/config.js`): `DATABASE_URL`, `JWT_SECRET`.

Start the backend:

```bash
npm run dev       # node src/index.js
# or
npm start
```

Backend listens on `PORT` (default 3001). Health checks: `GET /health`, `GET /health/live`, `GET /health/ready`.

### 4. ML service setup

```bash
cd ml_service
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

The ML service defaults to reading data from `public_supply_chain_synthetic/data` and writing artifacts to `ml_service/artifacts`, overridable via `ML_DATA_DIR` and `ML_ARTIFACT_DIR`.

Train the demand model (produces `ml_service/artifacts/demand_model.joblib`):

```bash
python scripts/train_demand.py
```

Start the ML service:

```bash
uvicorn ml_service.api.app:app --host 0.0.0.0 --port 8000 --app-dir src
```

ML service listens on port **8000**. Health: `GET /api/v1/health`, `/api/v1/health/live`, `/api/v1/health/ready`.

### 5. Frontend setup

```bash
cd frontend
npm install
npm run dev       # vite, default port 5173
```

Vite proxies `/api` to `http://localhost:3001` (`vite.config.js`). In production, set `VITE_API_BASE_URL` to the backend origin.

### 6. Run database migrations

Migrations run automatically when the Docker Compose postgres container starts. To apply them manually against an existing PostgreSQL instance:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f database/migrations/002_route_candidates.sql
```

### 7. Import seed datasets

Run the CSV seeder from the repository root (requires `DATABASE_URL`):

```bash
python database/seeds/seed_from_csv.py --target local
```

The script requires `--target local` (host must be localhost/127.0.0.1/::1) or `--target neon` (host must end in `.neon.tech`). It imports tables in dependency order:

1. `roles`
2. `districts`
3. `products`
4. `warehouses`
5. `warehouse_districts`
6. `vehicles`
7. `historical_demand`
8. `inventory`
9. `shipments`

It prints per-table progress and a verification summary comparing rows processed vs. rows present in the database. Connection errors are sanitized so credentials are never printed.

### Verification

After all services are running:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/health
- ML service health: http://localhost:8000/api/v1/health

---

## Dataset Initialization and Data Management

### Existing mechanism: `seed_from_csv.py`

`database/seeds/seed_from_csv.py` is a **developer-operated database initialization script**, not a user-facing feature. There is no CSV/Excel upload endpoint in the frontend or backend.

**Supported dataset files** (all under `public_supply_chain_synthetic/data/`):

| Source file | Table imported |
|---|---|
| `core/districts.csv` | `districts` |
| `core/products.csv` | `products` |
| `core/warehouses.csv` | `warehouses` |
| `logistics/route_allocation_candidates.csv` | `warehouse_districts` (mapping only) |
| `logistics/vehicle_fleet.csv` | `vehicles` |
| `core/monthly_demand_history.csv` | `historical_demand` |
| `core/inventory_snapshot.csv` | `inventory` |
| `logistics/historical_shipments.csv` | `shipments` |

The `roles` table is seeded with the four built-in roles (ADMIN, PLANNER, WAREHOUSE_MANAGER, ANALYST) independent of any CSV.

**Import order and dependencies** follow foreign-key constraints: roles → districts/products → warehouses → warehouse_districts → vehicles → historical_demand → inventory → shipments. All inserts use `ON CONFLICT ... DO NOTHING`, so re-running is idempotent for existing rows.

**Safeguards:**
- `DATABASE_URL` must be set; the script exits with an error otherwise.
- `--target local` restricts the connection host to localhost/127.0.0.1/::1; `--target neon` requires a `.neon.tech` hostname. This prevents accidental imports to unintended hosts.
- Database errors are sanitized; connection URIs (including credentials) are never printed.
- A verification pass compares rows processed against rows present in the database.

**Important:** `procurement_orders.csv` (`data/core/`) and `warehouse_utilization.csv` (`data/logistics/`) exist in the repository but are **not** imported by the seed script.

### Planned Enhancement: User-Facing Data Import

This functionality is **not implemented**. A possible future design would:

1. Add a frontend file-upload component (CSV/Excel) with multipart parsing.
2. Add a backend endpoint `POST /api/datasets/import` with multipart handling, role restricted to Admin/Planner.
3. Validate CSV headers and column types against expected schemas before persisting.
4. Preview parsed rows in the UI before commit, with row-level error reporting.
5. Detect duplicates (e.g. existing `district_id`, `shipment_id`) and offer skip/overwrite/abort options.
6. Run imports inside a database transaction and write an audit-log entry.
7. Restrict file size and enforce `DB_SSL`/production-origin checks as with other endpoints.

Until this is built, dataset initialization remains the CLI `seed_from_csv.py` process described above.

---

## API Documentation

All backend routes require authentication unless noted. Role requirements are shown where enforced.

| Method | Endpoint | Purpose | Auth / Roles |
|---|---|---|---|
| GET | `/health` | Backend + database health | None |
| GET | `/health/live` | Liveness probe | None |
| GET | `/health/ready` | Readiness probe (DB check) | None |
| POST | `/api/auth/register` | Register user (public only ANALYST; privileged roles require ADMIN) | Public / ADMIN for privileged roles |
| POST | `/api/auth/login` | Login, returns JWT | None |
| GET | `/api/auth/me` | Current user profile | Authenticated |
| POST | `/api/demand/forecast` | Generate demand forecast via ML service | Authenticated / ADMIN, PLANNER, ANALYST |
| GET | `/api/demand/forecasts` | List stored forecasts | Authenticated |
| GET | `/api/demand/history` | List historical demand | Authenticated |
| GET | `/api/demand/metrics` | Proxy ML model metrics | Authenticated |
| POST | `/api/demand/explain` | SHAP explanations for records | Authenticated |
| GET | `/api/inventory` | List inventory | Authenticated |
| POST | `/api/inventory/optimize` | Inventory optimization via ML service | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| GET | `/api/warehouses` | List warehouses | Authenticated |
| GET | `/api/warehouses/:id` | Warehouse detail | Authenticated |
| GET | `/api/products` | List products | Authenticated |
| GET | `/api/districts` | List districts | Authenticated |
| GET | `/api/logistics/shipments` | List shipments | Authenticated |
| POST | `/api/logistics/routes/optimize` | Route optimization via ML service | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/shipments` | Create shipment | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/routes/optimize` | Route optimization (duplicate of logistics route) | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| GET | `/api/recommendations` | List recommendations | Authenticated |
| GET | `/api/recommendations/:id` | Recommendation detail | Authenticated |
| POST | `/api/recommendations/generate` | Generate replenishment recommendations | Authenticated / ADMIN, PLANNER |
| PATCH | `/api/recommendations/:id/status` | Update recommendation status | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/recommendations/:id/approve` | Approve recommendation | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/recommendations/:id/reject` | Reject recommendation | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/approvals/:id/approve` | Approve recommendation (alias route) | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| POST | `/api/approvals/:id/reject` | Reject recommendation (alias route) | Authenticated / ADMIN, PLANNER, WAREHOUSE_MANAGER |
| GET | `/api/dashboard/summary` | Dashboard counts | Authenticated |
| GET | `/api/audit` | Audit logs (latest 200) | Authenticated / ADMIN, ANALYST |

### ML service routes (called by backend, not directly by frontend)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | ML service health + model loaded status |
| GET | `/api/v1/health/live` | Liveness |
| GET | `/api/v1/health/ready` | Readiness (model artifact loaded) |
| GET | `/api/v1/models` | Model info and metrics |
| GET | `/api/v1/demand/metrics` | Training/evaluation metrics |
| POST | `/api/v1/demand/forecast` | Demand forecast |
| POST | `/api/v1/demand/explain` | SHAP explanations |
| POST | `/api/v1/inventory/optimize` | Inventory optimization |
| POST | `/api/v1/routes/optimize` | Route optimization |

The backend proxies ML responses; upstream failures (500/503/malformed/timeout) are mapped to generic 500/503 responses without leaking stack traces.

---

## Authentication and Security

### JWT authentication

- Tokens are signed with `jsonwebtoken` using `JWT_SECRET`, default expiry `JWT_EXPIRES_IN` (8h).
- The payload contains `sub` (user id), `email`, and `role`.
- On login (`POST /api/auth/login`), credentials are verified against the bcrypt hash; a token and user object are returned.
- The frontend stores the token in `localStorage` (`auth_token`) and sends it as `Authorization: Bearer <token>` via an Axios request interceptor. A 401 response clears stored credentials and redirects to `/login`.

### Password hashing

- Passwords are hashed with `bcryptjs` at cost 10 (`userRepo.js`).
- Plaintext passwords are never stored or logged.

### Role-based access control (RBAC)

Four roles: `ADMIN`, `PLANNER`, `WAREHOUSE_MANAGER`, `ANALYST`.

- `authenticate` middleware verifies the JWT and attaches `req.user`.
- `requireRoles(...)` middleware grants access only to listed roles.
- Public registration can only create `ANALYST` accounts; creating any other role requires an authenticated ADMIN.
- Route-level authorization is enforced per endpoint (see API table).

### Input validation

- All mutating endpoints validate request bodies with `zod` schemas; validation failures return `400` with details.
- Request bodies are limited to 2 MB (`express.json({ limit: "2mb" })`); oversized requests return `413`.
- `POST /api/demand/explain` limits records to 1–1000.

### Audit logging

- `auditService.logAudit` writes to `audit_logs` (user, action, entity type/id, metadata JSONB, IP address).
- Audit entries are written for login, forecast generation, inventory optimization, recommendation create/approve/reject, shipment creation, and route optimization.

### Environment-variable handling

- Required variables: `DATABASE_URL`, `JWT_SECRET` (backend enforces at startup).
- SSL is **explicit**, never inferred from `NODE_ENV`: `DB_SSL` (default false) and `DB_SSL_REJECT_UNAUTHORIZED` (default true). When SSL is disabled, `sslmode` is stripped from `DATABASE_URL` so local non-SSL PostgreSQL works.
- CORS origins are a comma-separated allowlist (`CORS_ORIGIN`); unknown origins are rejected with no `Access-Control-Allow-Origin` header.

### Production safeguards

- `backend/.env` (containing real credentials) is gitignored and must never be committed.
- `docker-compose.prod.yml` requires `POSTGRES_PASSWORD` and `JWT_SECRET` at startup (`${VAR:?...}`).
- Error responses to clients are generic (`"Internal server error"`); full errors are logged as message-only.
- `seedUsers.js` / `seedDemoUsers.js` refuse to run in `production` without an explicit opt-in env var (`ALLOW_SEED_USERS` / `ALLOW_DEMO_USER_SEED`).

---

## Testing

Test suites exist for all three services. **Test outcomes are not claimed here**; run them yourself to verify.

### Backend (Node `node:test`)

```bash
cd backend
npm test        # node --test tests/*.test.js
npm run lint    # node --check src/index.js
```

Backend integration tests require a running backend on `http://127.0.0.1:3001`, a reachable ML service, and seeded PostgreSQL data. They cover auth, RBAC, approvals, DB queries, ML proxying, explain validation, oversized-body handling, upstream ML failure mapping, demo-user seeding, and seed guards.

### Frontend (Vitest)

```bash
cd frontend
npm test        # vitest run
npm run lint    # oxlint
npm run build   # vite build
```

Covers page rendering (Warehouses, Analytics) and the Login page smoke test with mocked API.

### ML service (pytest)

```bash
cd ml_service
# activate virtualenv first
pip install -r requirements-dev.txt
pytest
```

Covers feature engineering, demand training/forecasting, SHAP output, inventory optimization, route feasibility, and FastAPI API endpoints (health, forecast, models).

---

## Deployment

The repository provides `docker-compose.yml` for local orchestration and `docker-compose.prod.yml` for production overrides.

### Services and responsibilities

| Service | Responsibility | Port |
|---|---|---|
| PostgreSQL (`pgvector/pgvector:pg16`) | Database + migrations on startup | 5432 (host 5433) |
| ML service (Python FastAPI) | Forecasting, explainability, inventory & route optimization | 8000 |
| Backend (Node.js + Express) | API, auth, RBAC, audit, database access | 3001 |
| Frontend (React + Vite) | Dashboard UI | 5173 (dev) |

### Environment configuration

Local development values are templated in `.env.example` (root) and `backend/.env.example`. Production deployment requires setting at minimum:

- `DATABASE_URL` (hosted PostgreSQL, e.g. Neon, with `sslmode=require`)
- `DB_SSL=true`
- `JWT_SECRET`
- `ML_SERVICE_URL`
- `CORS_ORIGIN` (comma-separated frontend origins, e.g. Vercel preview + production)
- `VITE_API_BASE_URL` on the frontend (Vercel) pointing at the backend origin

### CORS requirements

The backend CORS allowlist must include the frontend origin(s). In local dev this defaults to `http://localhost:5173`. In production, set `CORS_ORIGIN` to the deployed frontend URL(s). Credentials are enabled, so the origin must be explicitly listed; wildcard origins are not supported with credentials.

### Deployment platforms (generic)

The audit documentation references Render for backend/ML hosting, Vercel for the frontend, and Neon for hosted PostgreSQL. These are described generically; no specific URLs are published in this document. Configure `VITE_API_BASE_URL`, `CORS_ORIGIN`, and `DATABASE_URL` to match your chosen providers.

---

## Limitations and Future Scope

- **Synthetic data dependency**: All data is synthetically generated in `public_supply_chain_synthetic/`; results do not reflect real public-distribution operations.
- **No user-facing data import**: Dataset initialization is the developer-run `seed_from_csv.py` CLI; there is no CSV/Excel upload in the UI.
- **Simulated logistics**: Distances, travel times, and costs are `*_simulated` columns, not live road-network routing.
- **Model generalization**: The Random Forest is trained on synthetic historical demand; accuracy on real data is unknown. No retraining, drift detection, or model monitoring is implemented.
- **No real public-distribution integration**: No connection to government APIs, FCI, PDS, or state-level systems.
- **No live routing**: No Google Maps, OSRM, or other road-network engine.
- **No automated ingestion**: Data enters only through the CSV seed script; no scheduled or event-driven pipeline.
- **RAG reserved but unused**: `pgvector`, `documents`, and `document_chunks` exist in the schema but are not wired into any feature or API route.

---

## Screenshots

Actual screenshots are not included in the repository. Add images under `docs/screenshots/` (or `frontend/screenshots/`) and reference them here:

- **Login** — sign-in form
- **Dashboard** — inventory, pending recommendations, shipments, and warehouse counts
- **Inventory** — stock levels, safety stock, reorder status per warehouse/product
- **Demand forecasting** — historical vs. forecasted demand charts
- **Explainability** — SHAP feature contributions for a forecast
- **Recommendations** — replenishment recommendations with PENDING/APPROVED/REJECTED status
- **Route optimization** — feasible vs. unserved shipments
- **Approval workflow** — approve/reject a recommendation with reason
- **Analytics** — reports and aggregated metrics

Example placeholder markup (replace with real image paths):

```markdown
![Login page](./docs/screenshots/login.png)
![Dashboard](./docs/screenshots/dashboard.png)
```

---

## License and Acknowledgements

No `LICENSE` file exists in this repository. The project is therefore not offered under any stated license. Contributors or forkers should add a license before redistribution.

### Acknowledgements

- scikit-learn, SHAP, pandas — ML modeling and explainability
- FastAPI, Uvicorn — ML service
- Node.js, Express, pg — backend API
- React, Vite, Tailwind CSS, Recharts — frontend
- PostgreSQL, pgcrypto, pgvector — database
- The synthetic data generators in `public_supply_chain_synthetic/`

---
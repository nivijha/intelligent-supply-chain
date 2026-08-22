# System Architecture

---

## 14. System Architecture

### 14.1 Final Architecture

```
Official Government Data Sources
        |
        v
Data Ingestion and Processing
        |
        v
    PostgreSQL
        |
        v
Node.js + Express Backend
        |
   +-----------+
   |           |
   v           v
Python ML   RAG Service
Service
   |
   v
Demand Forecast
        |
        v
Inventory/Warehouse Analysis
        |
        v
Recommendation Engine
        |
        v
SHAP Explainability
        |
        v
React Dashboard
        |
        v
   Human User
```

RAG can also connect directly to the dashboard for the knowledge assistant.

### 14.2 Architecture Layers

| Layer | Components | Technology |
|-------|-----------|------------|
| **Data Sources** | FCI reports, DFPD data, government circulars | Official government portals |
| **Data Processing** | Ingestion, cleaning, feature engineering | Python scripts, pandas |
| **Storage** | Operational data, document embeddings | PostgreSQL, Vector DB |
| **Backend** | API server, authentication, routing | Node.js, Express, JWT |
| **ML Service** | Forecasting, analysis, recommendations | Python, FastAPI, XGBoost |
| **Knowledge** | Document retrieval, answer generation | RAG pipeline, LLM |
| **Frontend** | Dashboard, charts, forms | React |
| **User** | Planners, warehouse managers, analysts | Human decision-makers |

### 14.3 Communication Flow

1. **Data ingestion:** Government data to processing scripts to PostgreSQL
2. **API requests:** React to Express to PostgreSQL (data retrieval)
3. **ML inference:** Express to FastAPI to ML model to forecast/analysis
4. **Recommendations:** FastAPI to rule engine to recommendation + explanation
5. **RAG queries:** React to Express to RAG service to vector store to LLM to answer
6. **Dashboard display:** Express to React to user visualization

### 14.4 Design Principles

- **Modular separation:** Frontend, backend, ML service are independently deployable
- **REST APIs:** All inter-service communication via HTTP REST
- **Stateless backend:** JWT tokens eliminate server-side session storage
- **Database abstraction:** ORM layer allows database technology changes
- **Human-in-the-loop:** All recommendations require human validation

### 14.5 Technology Selection Rationale

| Component | Technology | Why Selected |
|-----------|-----------|--------------|
| Frontend | React | Component ecosystem, state management, Vercel deployment |
| Backend | Node.js + Express | JavaScript full-stack, NPM ecosystem, mature framework |
| Database | PostgreSQL | ACID compliance, relational model, free and open-source |
| ML Service | Python + FastAPI | ML ecosystem, automatic docs, type validation |
| Forecasting | XGBoost/Prophet | Simpler models, easier to explain, no GPU required |
| Explainability | SHAP | Theoretically grounded, consistent feature importance |
| RAG | Vector DB + LLM | Document-grounded answers, reduced hallucination |
| Auth | JWT | Stateless, standard, works across services |

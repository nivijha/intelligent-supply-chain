# Team Distribution

---

## 49. Project Team Distribution

### Member 1: Backend + Database + Authentication/RBAC

**Responsibilities:**
- Node.js/Express server setup and configuration
- PostgreSQL schema design and implementation
- JWT authentication implementation
- RBAC middleware development
- REST API endpoint development
- Database migrations and seeding
- Backend documentation

**Deliverables:**
- Backend API server
- Database schema and migrations
- Authentication system
- RBAC middleware
- API documentation

**Dependencies:**
- Needs data schema from Member 2 for forecast/inventory tables
- Provides API specifications for Member 3

### Member 2: ML + Data Processing + Forecasting + Explainability

**Responsibilities:**
- Data preprocessing pipeline
- Feature engineering
- ARIMA/Prophet baseline model
- XGBoost model development
- Model evaluation and comparison
- FastAPI service setup
- SHAP explainability integration
- ML documentation

**Deliverables:**
- Preprocessing scripts
- Trained ML models
- FastAPI inference service
- Model evaluation report
- Explainability module

**Dependencies:**
- Needs government dataset access
- Requires Member 1's API endpoints for data ingestion
- Provides model inference URLs for Member 3

### Member 3: Frontend + RAG + Integration + Dashboard

**Responsibilities:**
- React application setup
- Dashboard page development
- All 8 page implementations
- UI component development
- RAG document processing pipeline
- RAG retrieval and answer generation
- Frontend-backend integration
- Frontend documentation

**Deliverables:**
- React dashboard application
- All page components
- RAG assistant interface
- Integration tests
- User workflows

**Dependencies:**
- Needs API specifications from Member 1
- Needs ML service URLs from Member 2

### Shared Responsibilities

| Task | Members | Timeline |
|------|---------|----------|
| Testing | All | Throughout development |
| Documentation | All | Distributed writing |
| Deployment | All | Weeks 11-12 |
| Presentation | All | Final week |
| Research paper review | All | Weeks 1-2 |

### Communication

- Weekly standup meetings
- Shared GitHub repository
- Documentation in docs/ folder
- Task tracking via GitHub Issues

# MVP

---

## 34. Minimum Viable Product

### MVP Scope

The MVP includes the core functionality that must be completed:

1. **Official dataset** - Historical demand data from government sources
2. **PostgreSQL database** - Schema with all core tables
3. **Node/Express backend** - REST API endpoints
4. **JWT authentication** - Login and token management
5. **RBAC** - Role-based access control
6. **Demand forecasting** - ARIMA/Prophet baseline + XGBoost
7. **Inventory analysis** - Stock status computation
8. **Recommendation engine** - Rule-based recommendations
9. **React dashboard** - All 8 pages functional

### What MVP Does NOT Include (Post-MVP)

- RAG assistant
- Advanced SHAP visualization
- Docker deployment
- CI/CD pipeline
- Comprehensive testing
- Production deployment

### MVP Success Criteria

- User can log in and see dashboard
- User can generate forecast for a commodity
- User can view inventory status
- User can generate and view recommendations
- All roles have appropriate access

### Priority Order

1. Database and backend (foundation)
2. Authentication and RBAC (security)
3. ML forecasting (core capability)
4. Inventory analysis (uses forecast)
5. Recommendations (uses analysis)
6. Frontend (user interface)

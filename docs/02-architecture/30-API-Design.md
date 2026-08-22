# API Design

---

## 25. API Design

### Base URL: http://localhost:3001/api

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login, receive JWT

### Inventory
- GET /api/inventory - Get all inventory (All roles)
- GET /api/inventory/:id - Get specific inventory (All roles)
- POST /api/inventory - Create/update inventory (ADMIN, PLANNER)

### Warehouse
- GET /api/warehouses - Get all warehouses (All roles)
- GET /api/warehouses/:id - Get warehouse details (All roles)

### Forecast
- POST /api/forecast - Generate forecast (ADMIN, PLANNER)
- GET /api/forecast/:commodityId - Get latest forecast (All roles)

### Recommendations
- GET /api/recommendations - Get recommendations (All roles)
- POST /api/recommendations/generate - Generate recommendation (ADMIN, PLANNER)

### RAG
- POST /api/rag/query - Query RAG assistant (All roles)

### Dashboard
- GET /api/dashboard/summary - Get KPI summary (All roles)

### Error Responses
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

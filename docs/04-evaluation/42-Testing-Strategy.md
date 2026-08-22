# Testing Strategy

---

## 37. Testing Strategy

### Unit Testing

- **Scope:** Individual functions, components, utilities
- **Tools:** Jest (JavaScript), pytest (Python)
- **Focus:** Forecast computation, rule evaluation, SHAP calculation
- **Coverage:** Core business logic functions

### Integration Testing

- **Scope:** API endpoints, database operations
- **Tools:** Jest/Supertest (API), pytest (Python)
- **Focus:** Authentication flow, CRUD operations, ML service calls
- **Coverage:** All API endpoints

### API Testing

- **Scope:** REST API contracts
- **Tools:** Postman/Insomnia
- **Focus:** Request/response validation, error handling, RBAC
- **Coverage:** All API endpoints

### ML Testing

- **Scope:** Model inference, prediction quality
- **Tools:** pytest
- **Focus:** Input validation, output shape, edge cases
- **Coverage:** Forecasting endpoints

### RAG Testing

- **Scope:** Document retrieval, answer quality
- **Tools:** Manual evaluation
- **Focus:** Retrieval relevance, answer grounding, citations
- **Coverage:** RAG query endpoint

### Frontend Testing

- **Scope:** Component rendering, user interactions
- **Tools:** React Testing Library, Cypress
- **Focus:** Form submission, navigation, responsive behavior
- **Coverage:** All pages and key components

### Authentication/RBAC Testing

- **Scope:** Login, token validation, role checks
- **Tools:** Jest/Supertest
- **Focus:** Valid/invalid credentials, unauthorized access, role-based denial
- **Coverage:** All protected endpoints

### End-to-End Testing

- **Scope:** Complete user workflows
- **Tools:** Cypress
- **Focus:** Login -> Forecast -> Recommendation -> RAG query
- **Coverage:** Critical user journeys

### Sample Test Cases

| Test | Type | Description |
|------|------|-------------|
| test_login_success | Unit | Valid credentials return JWT |
| test_login_invalid | Unit | Invalid credentials return 401 |
| test_forecast_api | Integration | POST /api/forecast returns forecast data |
| test_inventory_status | Unit | Correct status for given stock levels |
| test_shap_values_sum | Unit | SHAP values sum to prediction difference |
| test_rag_retrieval | Integration | Retrieved chunks are relevant to query |
| test_rbac_admin | Integration | Admin can access all endpoints |
| test_rbac_viewer | Integration | Viewer cannot access POST endpoints |

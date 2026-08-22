# Frontend Design

---

## 26. Frontend Design

### Pages

| Page | Route | Access |
|------|-------|--------|
| Login | /login | All |
| Dashboard | / | All |
| Inventory | /inventory | All |
| Demand Forecast | /forecast | All |
| Warehouse | /warehouses | All |
| Recommendations | /recommendations | All |
| RAG Assistant | /rag | All |
| User Management | /admin/users | ADMIN |

### Dashboard
- KPI cards (commodities, forecasts, alerts, recommendations)
- Summary charts
- Quick links

### Inventory
- Filter bar (commodity, warehouse, status)
- Data table with status badges

### Forecast
- Commodity/horizon selectors
- Generate button
- Line chart (historical + predicted)
- SHAP explanation panel

### Warehouse
- Warehouse cards with utilization bars
- Capacity alerts

### Recommendations
- Recommendation cards
- Status filters
- Accept/Reject buttons

### RAG
- Chat interface
- Source citations

### Tech Stack

| Technology | Purpose |
|------------|---------|
| React | UI framework |
| React Router | Routing |
| Recharts | Charts |
| Tailwind CSS | Styling |
| Axios | HTTP client |

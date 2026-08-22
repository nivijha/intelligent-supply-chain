# Scope

---

## 7. Scope

### 7.1 In Scope

| Area | Description |
|------|-------------|
| **Use case** | Indian public-sector food/agricultural supply chain |
| **Demand forecasting** | Monthly demand prediction for selected commodities |
| **Inventory analysis** | Stock status computation (Normal/Low/Critical/Overstock) |
| **Warehouse analysis** | Utilization metrics and capacity alerts |
| **Replenishment recommendations** | Rule-based suggestions for stock replenishment |
| **Stock alerts** | Alerts when inventory falls below safety thresholds |
| **Allocation recommendations** | Basic suggestions for inter-warehouse transfers |
| **Explainable AI** | SHAP feature importance for predictions |
| **RAG assistant** | Knowledge-grounded answers from official documents |
| **Dashboard** | Role-based React interface for all user types |
| **Authentication** | JWT-based user authentication |
| **RBAC** | Role-based access control (Admin, Planner, Warehouse Manager, Analyst) |
| **REST APIs** | HTTP endpoints for all system operations |

### 7.2 Out of Scope

| Area | Reason |
|------|--------|
| **Automatic inventory movement** | System provides recommendations, not physical execution |
| **Real-time IoT tracking** | No sensor integration in prototype |
| **Autonomous decision-making** | Human-in-the-loop required for all operational decisions |
| **Fleet control** | No transportation management or route optimization |
| **Reinforcement learning** | Not required for prototype scope |
| **Digital twins** | Not required for prototype scope |
| **Enterprise-scale Kafka** | REST APIs sufficient for current workload |
| **Kubernetes** | Single-node deployment sufficient for prototype |
| **Advanced route optimization** | Not required unless data and time permit |
| **Real-world deployment** | Prototype not intended for actual government operations |

### 7.3 Prototype vs. Production

| Aspect | Prototype | Production (Future) |
|--------|-----------|---------------------|
| Scale | 10-50 concurrent users | Thousands of users |
| Data | Historical government data | Real-time operational data |
| Deployment | Single server/container | Distributed cloud infrastructure |
| Integration | REST APIs | Event-driven architecture possible |
| ML models | Retrained periodically | Continuous learning pipeline |
| Monitoring | Basic logging | Comprehensive observability |
| RAG documents | Selected reports | Complete document corpus |

### 7.4 Assumptions

1. Historical demand data is available from government sources
2. Warehouse capacity data is accessible or estimable
3. Official documents are available in digital format
4. The system operates in a controlled development environment
5. Users have basic computer literacy
6. Internet connectivity is available for API communication

# Objectives

---

## 6. Objectives

### 6.1 Primary Objectives

1. **Collect and preprocess official government data**

   - Identify reliable data sources (FCI reports, DFPD data, state warehouse records)
   - Ingest data into the system pipeline
   - Clean and normalize data for analytical use
   - Perform feature engineering for time-series forecasting

2. **Store structured operational data in PostgreSQL**

   - Design relational schema for commodities, warehouses, inventory, and demand
   - Implement data integrity constraints
   - Enable efficient querying for analytics and ML

3. **Develop a demand forecasting model**

   - Implement baseline model (ARIMA or Prophet)
   - Develop ML model (XGBoost) with engineered features
   - Evaluate models using MAE, RMSE, MAPE metrics
   - Deploy model via FastAPI inference endpoint

4. **Analyze inventory and warehouse conditions**

   - Compute inventory status (Normal, Low Stock, Critical, Overstock)
   - Calculate warehouse utilization percentages
   - Identify capacity constraints and regional imbalances

5. **Generate transparent recommendations using a rule-based engine**

   - Define IF-THEN business rules for operational decisions
   - Generate replenishment, transfer, and allocation recommendations
   - Ensure recommendations are interpretable and auditable

6. **Provide model explanations using SHAP**

   - Compute feature importance for demand forecasts
   - Generate human-readable explanations for predictions
   - Display explanations alongside recommendations

7. **Implement a focused RAG assistant for official documents**

   - Process government reports, policies, and circulars
   - Create embeddings and vector storage
   - Enable document-grounded query answering with source citations

8. **Provide results through a role-based React dashboard**

   - Implement role-based views (Admin, Planner, Warehouse Manager, Analyst)
   - Display KPI cards, charts, tables, and recommendation cards
   - Integrate RAG assistant interface

### 6.2 Secondary Objectives

9. Implement JWT authentication and RBAC for secure access
10. Document system architecture, APIs, and database design
11. Conduct testing across all components
12. Prepare comprehensive project documentation

### 6.3 Measurable Criteria

| Objective | Measurable Criterion |
|-----------|---------------------|
| Data collection | At least 2 years of historical demand data for selected commodities |
| Database | Schema with 10+ tables, all relationships implemented |
| Forecasting | MAPE below configurable threshold on test set |
| Recommendations | Rule coverage for 5+ operational scenarios |
| Explainability | SHAP explanations for all forecast predictions |
| RAG | Answer grounding verified for 20+ sample queries |
| Dashboard | All 8 pages functional with role-based access |

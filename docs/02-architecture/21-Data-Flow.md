# Data Flow

---

## 16. Data Flow

### 16.1 Complete Data Flow

```
Government Data
    -> ingestion
    -> validation
    -> cleaning
    -> feature engineering
    -> PostgreSQL
    -> backend API
    -> ML service
    -> demand forecast
    -> inventory analysis
    -> warehouse analysis
    -> recommendation engine
    -> explanation (SHAP)
    -> dashboard
    -> human decision
```

### 16.2 RAG Data Flow

```
Government Documents
    -> parsing
    -> chunking
    -> embedding generation
    -> vector store
    -> query embedding
    -> similarity search
    -> retrieved chunks
    -> LLM answer generation
    -> answer + citations
    -> dashboard
```

### 16.3 Concrete Example: Wheat Supply Chain

**Step 1:** Data Collection - FCI monthly procurement reports (CSV)
**Step 2:** Ingestion - Python script reads CSV files
**Step 3:** Validation - Check for invalid values
**Step 4:** Cleaning - Handle missing data, normalize units
**Step 5:** Feature Engineering - Create lag features, seasonal indicators
**Step 6:** PostgreSQL Storage - Store in historical_demand table
**Step 7:** API Request - User triggers forecast generation
**Step 8:** ML Service Call - Backend calls FastAPI /predict endpoint
**Step 9:** Forecast Generation - Model predicts [52000, 54000, 51000] tonnes
**Step 10:** Inventory Analysis - 52000 > 35000 + 8000 -> Status: Low Stock
**Step 11:** Warehouse Analysis - Calculate utilization percentages
**Step 12:** Recommendation Engine - Generate replenishment recommendation
**Step 13:** SHAP Explanation - Feature importance breakdown
**Step 14:** Dashboard Display - Show forecast, inventory, recommendations
**Step 15:** Human Decision - Planner validates and acts on recommendation

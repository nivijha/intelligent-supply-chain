# Experimental Design

---

## 41. Experimental Design

### Dataset Selection

- Source: FCI/DFPD official reports
- Time range: 2-3 years of monthly data
- Commodities: Wheat, Rice (primary), others if available
- Split: 70% training, 15% validation, 15% testing (chronological)

### Baseline Models

1. **Naive forecast:** Last observed value repeated
2. **ARIMA:** Statistical time-series model
3. **Prophet:** Seasonal decomposition model

### ML Model

- **XGBoost Regressor** with engineered features
- Features: lag_1, lag_3, rolling_mean, rolling_std, month, year, festival_flag
- Hyperparameter tuning via grid search on validation set

### Evaluation Metrics

| Metric | Formula | Use Case |
|--------|---------|----------|
| MAE | Mean Absolute Error | Primary metric |
| RMSE | Root Mean Squared Error | Penalizes large errors |
| MAPE | Mean Absolute Percentage Error | Relative error |

### Recommendation Validation

- Rule validation against known scenarios
- Scenario testing with different forecast outcomes
- Manual expert review of recommendations

### RAG Evaluation

- Retrieval relevance: Top-k precision
- Answer groundedness: Manual review of 20+ queries
- Citation correctness: Verify source references

### Ablation Study (if time permits)

- Full system vs. without SHAP
- Full system vs. without RAG
- With vs. without feature engineering
- XGBoost vs. ARIMA vs. Prophet

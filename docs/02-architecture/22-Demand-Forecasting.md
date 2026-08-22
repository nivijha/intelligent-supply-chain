# Demand Forecasting Architecture

---

## 17. Demand Forecasting

### 17.1 Architecture

```
Historical Data
      |
      v
Feature Engineering
      |
      v
Baseline Model (ARIMA/Prophet)
      |
      v
ML Model (XGBoost)
      |
      v
Forecast
      |
      v
Evaluation (MAE, RMSE, MAPE)
```

### 17.2 Model Selection

| Model | Type | Purpose |
|-------|------|---------|
| ARIMA | Statistical baseline | Provides simple forecast benchmark |
| Prophet | Seasonal decomposition | Handles trend + seasonality |
| XGBoost | ML model | Primary forecasting with engineered features |

### 17.3 Input Features

| Feature | Description | Type |
|---------|-------------|------|
| month | Month of year (1-12) | Cyclical |
| year | Year | Temporal |
| lag_1 | Demand in previous month | Temporal |
| lag_3 | Demand 3 months ago | Temporal |
| rolling_mean_3 | 3-month moving average | Statistical |
| rolling_std_3 | 3-month standard deviation | Statistical |
| festival_flag | Whether month contains major festival | Categorical |
| region | Geographic region | Categorical |

### 17.4 Target Variable

- **Target:** Monthly demand quantity (tonnes) for the commodity
- **Horizon:** 1-6 months ahead (prototype focuses on 3 months)

### 17.5 Train/Validation/Test Split

- **Method:** Chronological (time-based) split
- **Training:** First 70% of historical data
- **Validation:** Next 15%
- **Testing:** Last 15%
- **No random shuffling:** Maintains temporal integrity

### 17.6 Evaluation Metrics

| Metric | Interpretation |
|--------|----------------|
| MAE | Average absolute prediction error in tonnes |
| RMSE | Penalizes large errors more heavily |
| MAPE | Percentage error |

### 17.7 Why Simpler Models

- Easier to explain to decision-makers
- No GPU required
- Work with limited historical data
- Sufficient for decision-support prototype

### 17.8 Model Deployment

- Training: Offline Python script
- Storage: joblib pickle file
- Inference: FastAPI REST endpoint
- Retraining: Periodic (every 6 months)

# Explainable AI

---

## 21. Explainable AI

### 21.1 Purpose

Provides transparent explanations for ML predictions.

### 21.2 SHAP

- Game-theoretic approach to feature importance
- Based on Shapley values
- Theoretically grounded, consistent, model-agnostic

### 21.3 How It Works

1. Baseline: Average prediction
2. Feature contributions: Each feature's push above/below baseline
3. Sum of contributions = prediction difference from baseline
4. Visualization: Bar charts

### 21.4 Example

Demand increases from 45000 to 52000 tonnes:
- Trend: +2800 (40%)
- Seasonality: +2100 (30%)
- Region: +1400 (20%)
- Baseline: +700 (10%)

### 21.5 Why Explainability

- Builds user trust
- Enables validation
- Supports debugging
- Provides audit trail

# Component Description (Part 3)

---

## 15. Architecture Components (Part 3)

### M. Inventory Analysis

- **What it is:** Computation of stock status for each commodity-warehouse combination
- **Why we need it:** Links forecast outputs to operational inventory state
- **What it receives:** Forecasted demand, current inventory, safety stock thresholds, lead time
- **What it produces:** Inventory status (Normal, Low Stock, Critical, Overstock)
- **Technology:** Python functions in FastAPI service
- **Alternative considered:** Separate deep-learning inventory model
- **Why sufficient:** Rule-based analysis is interpretable and sufficient for prototype

### N. Warehouse Analysis

- **What it is:** Computation of warehouse utilization and capacity metrics
- **Why we need it:** Identifies capacity constraints and regional imbalances
- **What it receives:** Warehouse capacity, current stock levels, regional demand data
- **What it produces:** Utilization percentages, capacity alerts, allocation suggestions
- **Technology:** Python functions in FastAPI service
- **Alternative considered:** Warehouse optimization algorithms
- **Why sufficient:** Simple operational metrics adequate for decision support

### O. Recommendation Engine

- **What it is:** Rule-based system translating predictions into operational recommendations
- **Why we need it:** Converts ML predictions into actionable suggestions for decision-makers
- **What it receives:** Forecast values, inventory status, warehouse metrics
- **What it produces:** Recommendations with justification (replenishment, transfer, hold)
- **Technology:** Python rule engine with IF-THEN conditions
- **Alternative considered:** Optimization-based recommendation system
- **Why sufficient:** Rules are interpretable, auditable, and easy to validate

### P. Business Rules

- **What it is:** Explicit IF-THEN conditions defining operational logic
- **Why we need it:** Ensures recommendations follow known operational guidelines
- **What it receives:** Forecast, inventory, warehouse data
- **What it produces:** Boolean conditions triggering specific recommendations
- **Technology:** Python conditional logic with configurable thresholds
- **Alternative considered:** Machine-learned decision rules
- **Why sufficient:** Explicit rules are easier to validate and modify than learned rules

### Q. SHAP Explainability

- **What it is:** Feature importance analysis using Shapley values
- **Why we need it:** Makes ML predictions transparent and interpretable
- **What it receives:** Trained model, input features for a prediction
- **What it produces:** Feature contribution scores and human-readable explanations
- **Technology:** SHAP library (shap)
- **Alternative considered:** LIME, permutation importance
- **Why sufficient:** SHAP provides theoretically grounded, consistent feature importance

### R. RAG

- **What it is:** Retrieval-Augmented Generation for document-grounded answers
- **Why we need it:** Provides knowledge assistance from official government documents
- **What it receives:** User query text
- **What it produces:** Answer with source document citations
- **Technology:** Vector store + embedding model + LLM
- **Alternative considered:** Fine-tuned LLM, standalone LLM
- **Why sufficient:** RAG separates knowledge from model, easier to update with new documents

# Recommendation Engine

---

## 20. Recommendation Engine

### 20.1 Purpose

Translates ML predictions into actionable suggestions using business rules.

### 20.2 Rules

**Rule 1: Replenishment**
IF forecasted_demand > current_inventory + safety_stock
THEN recommend "Replenishment required"

**Rule 2: Warehouse Transfer**
IF warehouse_A.utilization > 80% AND warehouse_B.utilization < 70%
THEN recommend "Consider transferring stock from A to B"

**Rule 3: Safety Stock Increase**
IF current_inventory < lead_time_demand
THEN recommend "Increase safety stock threshold"

**Rule 4: Order Reduction**
IF forecasted_demand < current_inventory * 0.5
THEN recommend "Reduce order quantity"

**Rule 5: Regional Shortage**
IF all_warehouses_in_region.utilization > 80%
THEN recommend "Regional shortage - escalate to planning"

### 20.3 Why Rules

- Interpretable (explicit conditions)
- Easy to validate (review each rule)
- Simple to modify (change threshold)
- Adequate for prototype

### 20.4 Recommendation Output

Each recommendation includes: Type, Commodity, Source/Target warehouse, Justification, SHAP explanation, Status, Created by, Reviewed by.

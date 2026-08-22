# Inventory Analysis

---

## 18. Inventory Analysis

### 18.1 Purpose

Computes stock status for each commodity-warehouse combination based on forecasted demand and current inventory.

### 18.2 Inputs

| Input | Description | Source |
|-------|-------------|--------|
| Forecasted Demand | Predicted demand for next period | ML forecast model |
| Current Inventory | Current stock level | PostgreSQL |
| Safety Stock | Buffer stock threshold | Configuration |
| Lead Time | Time between ordering and receiving | Configuration |

### 18.3 Processing

**Safety Stock:** Z * sigma_d * sqrt(L)
- Z = Service level factor (1.65 for 95%)
- sigma_d = Standard deviation of daily demand
- L = Lead time in days

**Status Logic:**

```
IF forecasted > current + safety_stock:
    IF forecasted > current * 1.5: Critical
    ELSE: Low Stock
ELIF forecasted < current * 0.5: Overstock
ELSE: Normal
```

### 18.4 Outputs

| Status | Condition | Color | Action |
|--------|-----------|-------|--------|
| Normal | Stock adequate | Green | No action |
| Low Stock | Stock insufficient | Yellow | Consider replenishment |
| Critical | Stock significantly low | Red | Urgent replenishment |
| Overstock | Stock exceeds demand | Blue | Consider redistribution |

### 18.5 Limitations

- Simple threshold-based analysis
- Does not account for supply variability
- No optimization (only status reporting)

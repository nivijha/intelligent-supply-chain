# Warehouse Analysis

---

## 19. Warehouse Analysis

### 19.1 Purpose

Computes warehouse utilization metrics and identifies regional imbalances.

### 19.2 Inputs

| Input | Description | Source |
|-------|-------------|--------|
| Warehouse Capacity | Maximum storage capacity (tonnes) | PostgreSQL |
| Current Stock | Current inventory level | PostgreSQL |
| Regional Demand | Demand for commodities served | Forecast data |

### 19.3 Processing

**Utilization:** (current_stock / capacity) * 100

**Status:**
- > 80%: High Utilization (alert)
- < 30%: Underutilized
- Otherwise: Normal

### 19.4 Outputs

| Output | Description |
|--------|-------------|
| Utilization Percentage | Current stock as % of capacity |
| Status | Normal, High Utilization, Underutilized |
| Capacity Alert | Boolean flag |
| Allocation Suggestion | Inter-warehouse transfer recommendation |

### 19.5 Limitations

- Does not perform vehicle routing
- Simple threshold-based analysis
- Recommendations are suggestions only

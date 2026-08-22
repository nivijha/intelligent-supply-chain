# Database Design

---

## 24. Database Design

### Tables

**User:** id, name, email, password_hash, role_id, created_at

**Role:** id, name

**Commodity:** id, name, category

**Warehouse:** id, name, location, capacity, region

**Inventory:** id, commodity_id, warehouse_id, current_stock, safety_stock, last_updated

**HistoricalDemand:** id, commodity_id, warehouse_id, date, demand_quantity

**Forecast:** id, commodity_id, warehouse_id, forecast_period, forecast_value, model_version, created_at

**Recommendation:** id, commodity_id, from_warehouse_id, to_warehouse_id, recommendation_type, justification, status, created_at, created_by

**Document:** id, title, source, document_type, upload_date, uploaded_by

**DocumentChunk:** id, document_id, chunk_index, content, embedding_vector

**AuditLog:** id, user_id, action, entity_type, entity_id, timestamp, ip_address

### Relationships

- User belongs to Role (Many-to-One)
- Inventory belongs to Commodity and Warehouse
- HistoricalDemand belongs to Commodity
- Forecast belongs to Commodity
- Recommendation belongs to Commodity and User
- Document has many DocumentChunks

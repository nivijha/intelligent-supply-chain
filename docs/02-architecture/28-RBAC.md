# RBAC

---

## 23. Role-Based Access Control

### 23.1 Roles

| Role | Description |
|------|-------------|
| ADMIN | Full access, user management |
| PLANNER | Forecasts, recommendations |
| WAREHOUSE_MANAGER | Inventory, warehouse data |
| ANALYST | Read-only dashboard |

### 23.2 Permissions

| Feature | ADMIN | PLANNER | WAREHOUSE_MGR | ANALYST |
|---------|-------|---------|---------------|---------|
| View Dashboard | Yes | Yes | Yes | Yes |
| Generate Forecast | Yes | Yes | No | No |
| Generate Recommendations | Yes | Yes | No | No |
| Edit Inventory | Yes | No | Yes | No |
| Manage Users | Yes | No | No | No |

### 23.3 JWT Flow

1. Login -> validate credentials
2. Generate JWT with user ID, role, expiration
3. Return token to frontend
4. Frontend sends Authorization: Bearer token
5. Middleware verifies token
6. Route checks role permissions

### 23.4 Security

- Password hashing: bcrypt
- JWT signing: HMAC-SHA256
- Token expiration: 24 hours
- Secret key in environment variables

# Security

---

## 38. Security

### Password Storage

- Hashing: bcrypt with salt rounds (minimum 10)
- Never store plain text passwords
- Password complexity requirements enforced at registration

### Authentication

- JWT tokens for stateless authentication
- Token expiration: 24 hours (configurable)
- Refresh token mechanism for production (future scope)
- Failed login attempts logged

### Authorization

- Role-Based Access Control (RBAC)
- Middleware checks token role against required role
- 403 Forbidden for unauthorized access attempts

### API Security

- Input validation on all endpoints (Joi/Zod)
- Parameterized queries to prevent SQL injection
- CORS configured for frontend origin only
- Rate limiting for API endpoints (future scope)

### Secrets Management

- JWT secret in environment variables
- Database credentials in environment variables
- Never commit secrets to repository
- Use .env files for development

### Deployment Security

- HTTPS in production (Let's Encrypt)
- Database not exposed to public internet
- Backend and ML service behind reverse proxy

### Audit Logging

- Log authentication events (success/failure)
- Log important actions (user creation, role changes)
- Log IP addresses for security monitoring

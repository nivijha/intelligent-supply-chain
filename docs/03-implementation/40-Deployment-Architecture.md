# Deployment Architecture

---

## 35. Deployment Architecture

### Production Deployment

| Component | Service | Technology |
|-----------|---------|------------|
| Frontend | Vercel / Netlify | React build |
| Backend API | Render / AWS | Node.js |
| ML Service | Render / AWS | Python FastAPI |
| Database | Supabase / AWS RDS | PostgreSQL |
| RAG/LLM | OpenAI API / self-hosted | LLM service |

### Docker Configuration

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
  
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=./models/xgboost.pkl
```

### Local Development

| Component | Command | Port |
|-----------|---------|------|
| Frontend | npm run dev | 5173 |
| Backend | node server.js | 3001 |
| ML Service | uvicorn main:app --reload | 8000 |
| PostgreSQL | docker run postgres | 5432 |

### Deployment Notes

- Single-node deployment sufficient for prototype
- No Kubernetes required
- Docker for consistency across environments
- Managed services for database to avoid maintenance

# Database

Start PostgreSQL with pgvector:

```bash
docker compose up -d
```

The initial schema in `migrations/001_initial_schema.sql` is applied automatically on first container startup.

Seed synthetic data:

```bash
DATABASE_URL=postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain python database/seeds/seed_from_csv.py
```

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

## Migration and volume notes

PostgreSQL only runs files in `/docker-entrypoint-initdb.d` on first initialization of an empty data volume.
Existing volumes are not re-migrated automatically. For development resets, use `docker compose down -v` only when data loss is acceptable; never do this for production data.

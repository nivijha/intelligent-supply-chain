# Backend — Intelligent Supply Chain API

Node.js / Express backend with JWT authentication, role-based authorization, PostgreSQL (pgvector) database, and FastAPI ML service integration.

## Demo User Provisioning

The backend includes a one-time demo-user provisioning script for provisioning temporary demo accounts in any environment (local or production Neon via Render).

### Purpose

Provision four demo accounts with bcrypt-hashed passwords so that the frontend can be demonstrated with working credentials. The script is **idempotent**: it creates missing accounts and skips existing ones without modifying them.

### Demo Accounts

| Name | Email | Temporary Password | Role |
|------|-------|-------------------|------|
| Rajesh Kumar | admin@isc.gov.in | admin123 | ADMIN |
| Priya Sharma | planner@isc.gov.in | planner123 | PLANNER |
| Amit Patel | analyst@isc.gov.in | analyst123 | ANALYST |
| Harpreet Singh | manager@isc.gov.in | manager123 | WAREHOUSE_MANAGER |

### How to Run

#### Locally (Docker Compose)

```bash
cd backend
npm run seed:demo-users
```

This uses `DATABASE_URL` from `backend/.env` (or the environment) and connects to the local Docker PostgreSQL without SSL (`DB_SSL=false`).

#### Against Production Neon (Render)

1. Deploy the backend normally and verify `/health` returns `{"database":"connected"}`.
2. Open a controlled terminal / one-time deployment environment with the production database configuration.
3. Set the required environment variables:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require"
export DB_SSL=true
export DB_SSL_REJECT_UNAUTHORIZED=false
export ALLOW_DEMO_USER_SEED=true
```

4. Run the provisioning script:

```bash
cd backend
npm run seed:demo-users
```

5. Confirm the script reports which users were created and which were skipped.
6. Verify accounts through read-only SQL (see below).
7. Log in through the Vercel frontend.

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required; never falls back to localhost) |
| `DB_SSL` | Set to `true` for hosted PostgreSQL (e.g. Neon), `false` for local Docker |
| `DB_SSL_REJECT_UNAUTHORIZED` | Set to `false` for Neon pooler (no client-cert validation), `true` otherwise |
| `ALLOW_DEMO_USER_SEED` | Must be `true` to run outside `NODE_ENV=development` |

### Production Safeguards

- The script **refuses to run** unless `ALLOW_DEMO_USER_SEED=true` is set when `NODE_ENV` is not `development`.
- The script **refuses to run** if `DATABASE_URL` is missing.
- The script **never falls back to localhost** when provisioning production.
- The script uses **`ON CONFLICT (email) DO NOTHING`** — existing users are skipped, never overwritten.
- Existing passwords, names, and roles are **never modified**.
- No passwords or hashes are ever printed to logs.
- PostgreSQL connections are closed reliably via `finally { await pool.end() }`.
- The script does **not** run automatically on application startup or deployment.

### Verify Accounts (Read-Only SQL)

```sql
-- List all demo users
SELECT u.email, u.name, r.name AS role, u.created_at
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.email IN (
  'admin@isc.gov.in',
  'planner@isc.gov.in',
  'analyst@isc.gov.in',
  'manager@isc.gov.in'
)
ORDER BY u.email;

-- Verify role assignments
SELECT r.name, count(u.id) AS user_count
FROM roles r
LEFT JOIN users u ON u.role_id = r.id
GROUP BY r.name;
```

### Password Hashing

Passwords are hashed with `bcryptjs` at cost factor 10, matching the existing `userRepo.createUser()` implementation. The `password_hash` column stores only the bcrypt hash — never plaintext.

### Security Notes

- These are **temporary demo credentials**. Rotate or disable them before public production use.
- Public registration (`POST /api/auth/register`) can only create `ANALYST` accounts. Creating `ADMIN`, `PLANNER`, or `WAREHOUSE_MANAGER` accounts requires authentication as an administrator.
- Do not run `npm run seed:demo-users` automatically during deployment. Run it explicitly when demo accounts are needed.

### npm Scripts

| Script | Description |
|--------|-------------|
| `npm run seed:demo-users` | Provision the four demo accounts (idempotent) |
| `npm run seed:users` | Legacy user seeding script |
| `npm test` | Run backend unit + integration tests |
| `npm run lint` | Syntax check |

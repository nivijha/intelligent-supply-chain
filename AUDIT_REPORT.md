# Intelligent Supply Chain — Repository Audit & Repair Report

## A. Root Cause Report

### 1. PostgreSQL SSL connection failure ("The server does not support SSL connections")
- **Files:** `backend/src/db/pool.js:9-14`, `backend/src/config.js`
- **Original problem:** `pool.js` enabled SSL (`{ rejectUnauthorized: true }`) whenever `NODE_ENV === "production"`. The backend `Dockerfile` sets `ENV NODE_ENV=production`, so the local Docker PostgreSQL (which does not speak SSL) was rejected with `Error: The server does not support SSL connections`. Health reported `{"database":"unavailable"}`.
- **Root cause:** SSL requirement was *inferred* from `NODE_ENV` instead of being explicitly configured. `NODE_ENV=production` is meaningless for SSL decisions (local dev can run production-mode; hosted DBs may or may not require SSL).
- **Why repeated failures:** Every backend restart in production mode re-attempted SSL to a non-SSL PostgreSQL, so `/health` and `/health/ready` permanently returned 503/unhealthy.
- **Fix:** Introduced explicit `DB_SSL` env var (default `false`) and `DB_SSL_REJECT_UNAUTHORIZED` (default `true`). SSL is never inferred from `NODE_ENV`. When `DB_SSL=false`, any `sslmode` parameter in `DATABASE_URL` is stripped so it cannot force SSL on a non-SSL server. Local Docker PostgreSQL uses `ssl:false`. Neon/hosted providers use `DB_SSL=true`.

### 2. CORS misconfiguration
- **File:** `backend/src/index.js`
- **Original problem:** `cors({ origin: config.corsOrigin, credentials: true })` accepted a single origin string; no support for comma-separated origins, trailing slashes were not normalized, unknown origins were not explicitly rejected, and a stray `console.log("========== CORS CONFIG ==========")` debug line was emitted.
- **Root cause:** `config.corsOrigin` was a single string and passed directly to `cors`; multiple Vercel preview origins or the production frontend origin were not handled.
- **Fix:** `config.corsOrigin` is now a parsed array (comma-split, trimmed, trailing-slash stripped, empty-filtered, defaults to `http://localhost:5173`). `cors` uses an origin function that allows same-origin/no-origin requests, reflects listed origins with `credentials: true`, and rejects unknown origins (no `Access-Control-Allow-Origin`). Removed debug log.

### 3. Missing API routes referenced by backend tests
- **Files:** `backend/src/routes/recommendations.routes.js` (added), `backend/src/routes/routes.routes.js` (new), `backend/src/index.js` (mounted)
- **Original problem:** Backend integration tests call `POST /api/recommendations/:id/approve`, `POST /api/recommendations/:id/reject`, and `POST /api/routes/optimize`. Only `POST /api/approvals/:id/approve|reject` and `POST /api/logistics/routes/optimize` existed, so those paths returned 404.
- **Root cause:** The approve/reject shortcut routes and a top-level `/api/routes/optimize` endpoint were never implemented, despite being the contract the tests expect.
- **Fix:** Added `POST /:id/approve` and `POST /:id/reject` to `recommendations.routes.js` (reusing `updateRecommendationStatus`). Created `routes.routes.js` with `POST /optimize` (route optimization) mounted at `/api/routes`. Existing `/api/approvals` routes preserved.

### 4. Broken GitHub Actions CI workflow
- **File:** `.github/workflows/ci.yml`
- **Original problem:** YAML indentation was broken (steps nested under `run` keys), duplicate database-verification steps, a health-check loop that exited 0 even when services never became ready (`for ... done` without explicit failure), `docker compose down -v` (destroyed persistent volumes), and a redundant `services.postgres` port-conflicting with `docker compose up`.
- **Root cause:** Hand-edited YAML with incorrect indentation and no explicit timeout failure.
- **Fix:** Rewrote the workflow: `ml-tests`, `frontend`, and `integration` jobs; reproducible `npm ci`/`pip install` from lockfiles; `docker compose up -d --build`; explicit readiness loops for PostgreSQL, backend, and ML that `exit 1` on timeout; seed order (roles → reference data → users → route candidates); backend tests; `failure()` log printing; `docker compose down` (no `-v`) to preserve volumes; no secrets printed.

### 5. Database connection errors leaked / generic handling
- **File:** `backend/src/index.js` (error handler)
- **Original problem:** The Express error handler logged the full error object (`console.error(err)`) and returned 500 for all failures.
- **Fix:** Sanitized logging to `err.message` only (no stack/credentials to client or logs). Client always receives a generic message. `/health` and `/health/ready` continue to return 503 when the database is unreachable, performing an actual `SELECT 1` connectivity check.

## B. Files Changed

| File | Change |
|------|--------|
| `backend/src/config.js` | Added `parseBoolean`/`parseOriginList`; `corsOrigin` is now an array; added `dbSsl` and `dbSslRejectUnauthorized`. SSL is no longer inferred from `NODE_ENV`. |
| `backend/src/db/pool.js` | Explicit `DB_SSL`/`DB_SSL_REJECT_UNAUTHORIZED`; `stripSslMode()` removes `sslmode` from `DATABASE_URL` when SSL is disabled; pooling tuned (`max`/`min`/`idleTimeoutMillis`/`connectionTimeoutMillis`/`keepAlive`); added `end()` export; `connect`/`error`/`remove` pool event hooks. |
| `backend/src/index.js` | CORS via origin function (comma-separated origins, credentials, reject unknown); removed debug `console.log`; sanitized error handler (message-only logging, generic client response). |
| `backend/src/routes/recommendations.routes.js` | Added `POST /:id/approve` and `POST /:id/reject` routes. |
| `backend/src/routes/routes.routes.js` | **New file.** `POST /optimize` route-optimization endpoint mounted at `/api/routes`. |
| `backend/src/index.js` | Imported and mounted `routesRoutes` at `/api/routes`. |
| `.github/workflows/ci.yml` | Rewrote CI: valid YAML, explicit readiness loops with timeout failure, correct seed order, reproducible installs, failure log printing, non-destructive teardown, no redundant `services.postgres`. |
| `.env.example` | Documented `DB_SSL` and `DB_SSL_REJECT_UNAUTHORIZED`. |
| `backend/.env.example` | Documented `DB_SSL` and `DB_SSL_REJECT_UNAUTHORIZED`. |
| `.gitignore` | Pre-existing working-tree change (adds `/backend/.env` to ignore the secrets file); left as-is. |

Note: `backend/.env` contains real credentials (Neon password/JWT secret) and is gitignored; it was **not** modified and is not part of the diff.

## C. Test Results

| Test | Status | Evidence |
|------|--------|----------|
| Backend unit + integration tests | PASS | `npm test` → 19 passed, 0 failed |
| Backend lint (`node --check`) | PASS | `config.js`, `pool.js`, `index.js`, routes all pass |
| Frontend unit tests | PASS | `vitest run` → 3 passed (2 files) |
| Frontend lint (`oxlint`) | PASS | Warnings only, no errors, exit 0 |
| Frontend production build | PASS | `vite build` → built successfully |
| ML tests (`pytest`) | PASS | 9 passed |
| ML health endpoint | PASS | `/api/v1/health` → healthy, `model_loaded:true` |
| ML forecast endpoint | PASS | `/api/v1/demand/forecast` → 24 records |
| Database migrations | PASS | 18 tables exist; `pgvector` 0.8.7 + `pgcrypto` enabled |
| Database FK integrity | PASS | 32 foreign keys valid |
| Database indexes | PASS | All required indexes present |
| Docker health (backend) | PASS | `/health` → `{"database":"connected"}` |
| Integration: valid login | PASS | 200 + JWT token |
| Integration: invalid login | PASS | 401 |
| Integration: authenticated `/auth/me` | PASS | 200 with token; 401 without |
| Integration: RBAC (analyst→generate) | PASS | 403 |
| Integration: backend-to-ML (`/demand/metrics`) | PASS | 200 (proxied to ML service) |
| Integration: CORS preflight (allowed origin) | PASS | 204 + reflected `Access-Control-Allow-Origin` + credentials |
| Integration: CORS preflight (unknown origin) | PASS | Rejected (no `Access-Control-Allow-Origin`) |

No test was marked PASS without running. No destructive database commands were run; existing local PostgreSQL volumes and data preserved.

## D. Deployment Configuration

Environment variables required (no actual secrets shown):

**Local development (Docker Compose):**
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `POSTGRES_PORT` maps host `5433` → container `5432`
- `PORT` (backend, default 3001)
- `DATABASE_URL=postgresql://<user>:<pass>@postgres:5432/<db>` (container-internal)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ML_SERVICE_URL=http://ml-service:8000`
- `CORS_ORIGIN=http://localhost:5173`
- `DB_SSL=false` (local PostgreSQL does not support SSL)
- `DB_SSL_REJECT_UNAUTHORIZED=true`
- `ML_DATA_DIR`, `ML_ARTIFACT_DIR`
- `BACKEND_PORT`, `ML_SERVICE_PORT`

**Render backend (production / hosted PostgreSQL e.g. Neon):**
- `DATABASE_URL=<Neon connection string with sslmode=require>`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=false` (Neon pooler requires SSL without client-cert validation)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `ML_SERVICE_URL=<ML service URL>`
- `CORS_ORIGIN=<Vercel frontend origin>` (comma-separated list for multiple preview/prod origins)
- `NODE_ENV=production`
- `PORT`

**Vercel frontend:**
- `VITE_API_BASE_URL=<Render backend URL>` (e.g. `https://intelligent-supply-chain.onrender.com`)
- In dev, Vite proxies `/api` → `http://localhost:3001` (dev only; not hardcoded in production builds)

Never commit `backend/.env` (gitignored) or any `.env` containing real credentials.

## E. Remaining Issues

1. **Frontend `VITE_API_BASE_URL` must be set in Vercel** for production. Without it, `api.js` falls back to `/api` (relative to the frontend origin), which will not reach the backend in production. Documented above; not enforced in code (intentionally, to avoid breaking local dev).
2. **CI integration job** was validated for YAML correctness but cannot be executed here (no GitHub Actions runner / Docker build context for the full ML image in this environment). The workflow is syntactically valid and follows the required readiness/seed/test/teardown sequence.
3. **CI does not run backend + frontend + ML in a single orchestrated run locally** — verified individually instead (all pass).
4. `backend/src/routes/logistics.routes.js` still duplicates route-optimization logic at `/api/logistics/routes/optimize` alongside the new `/api/routes/optimize`. This is intentional to preserve existing behavior while satisfying the test contract; could be deduplicated in a follow-up.

## F. Git Changes

Branch: `main` (up to date with `origin/main`).

Modified files:
- `.env.example`
- `.github/workflows/ci.yml`
- `.gitignore` (pre-existing working-tree change: ignores `/backend/.env`)
- `backend/.env.example`
- `backend/src/config.js`
- `backend/src/db/pool.js`
- `backend/src/index.js`
- `backend/src/routes/recommendations.routes.js`

New file:
- `backend/src/routes/routes.routes.js`

Untracked/build artifacts (not to be committed): `frontend/dist/`, `backend/.env` (gitignored), `node_modules/`, `.venv/`, `ml_service/artifacts/`, `__pycache__/`, `.pytest_cache/`.

Suggested commit message:
```
fix: repair DB SSL, CORS, routes, and CI workflow

- Replace NODE_ENV-inferred SSL with explicit DB_SSL / DB_SSL_REJECT_UNAUTHORIZED;
  strip sslmode from DATABASE_URL when SSL disabled (fixes local PostgreSQL
  "server does not support SSL connections").
- Support comma-separated CORS origins with credentials; reject unknown origins;
  remove debug CORS log; sanitize error handler.
- Add POST /api/recommendations/:id/approve|reject and POST /api/routes/optimize
  routes to satisfy the backend integration test contract.
- Rewrite CI workflow: valid YAML, explicit readiness loops with timeout failure,
  correct seed order (roles before users), reproducible installs, failure logs,
  non-destructive teardown.
```

**Note:** Changes were not committed or pushed, per instructions (only commit/push if explicitly authorized).

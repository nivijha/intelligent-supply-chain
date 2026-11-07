import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

function pathBasename(p) {
  return p.split(/[/\\]/).pop();
}

const SCRIPT_NAME = pathBasename(fileURLToPath(import.meta.url));

const DEMO_USERS = [
  { name: "Rajesh Kumar", email: "admin@isc.gov.in", password: "admin123", role: "ADMIN" },
  { name: "Priya Sharma", email: "planner@isc.gov.in", password: "planner123", role: "PLANNER" },
  { name: "Amit Patel", email: "analyst@isc.gov.in", password: "analyst123", role: "ANALYST" },
  { name: "Harpreet Singh", email: "manager@isc.gov.in", password: "manager123", role: "WAREHOUSE_MANAGER" },
];

const BCRYPT_COST = 10;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === null) return defaultValue;
  return String(value).toLowerCase() === "true";
}

function isProduction() {
  return process.env.NODE_ENV !== "development";
}

function requireProductionOptIn() {
  if (isProduction() && process.env.ALLOW_DEMO_USER_SEED !== "true") {
    throw new Error(
      "Refusing to provision demo users outside development. " +
        "Set ALLOW_DEMO_USER_SEED=true to explicitly opt in to production provisioning."
    );
  }
}

function stripSslMode(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

const useSsl = parseBoolean(process.env.DB_SSL, false);
const rejectUnauthorized = parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true);

const pool = new Pool({
  connectionString: useSsl ? process.env.DATABASE_URL : stripSslMode(process.env.DATABASE_URL),
  ssl: useSsl ? { rejectUnauthorized } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  min: Number(process.env.DB_POOL_MIN || 0),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error.message);
});

async function ensureRolesExist(pool, roleNames) {
  for (const roleName of roleNames) {
    const { rows } = await pool.query("SELECT id FROM roles WHERE name = $1", [
      roleName,
    ]);
    if (rows.length === 0) {
      throw new Error(
        `Required role '${roleName}' does not exist in the database. Seed roles before provisioning demo users.`
      );
    }
  }
}

async function provisionUsers(pool, users) {
  const results = { created: [], skipped: [] };

  for (const u of users) {
    const email = normalizeEmail(u.email);
    const hash = await bcrypt.hash(u.password, BCRYPT_COST);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = $4))
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email`,
      [u.name, email, hash, u.role]
    );

    if (rows.length > 0) {
      results.created.push({ email, name: u.name, role: u.role });
    } else {
      results.skipped.push({ email, name: u.name, role: u.role });
    }
  }

  return results;
}

export {
  DEMO_USERS,
  BCRYPT_COST,
  normalizeEmail,
  isProduction,
  requireProductionOptIn,
  ensureRolesExist,
  provisionUsers,
  pool,
};

export async function main() {
  requireProductionOptIn();

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is required. Never fall back to localhost for production provisioning."
    );
  }

  try {
    const roleNames = [...new Set(DEMO_USERS.map((u) => u.role))];
    await ensureRolesExist(pool, roleNames);

    const results = await provisionUsers(pool, DEMO_USERS);

    console.log("[DEMO USER PROVISIONING] Results:");
    console.log(`  Created: ${results.created.length}`);
    for (const u of results.created) {
      console.log(`    + ${u.email} (${u.role})`);
    }
    console.log(`  Skipped (already exist): ${results.skipped.length}`);
    for (const u of results.skipped) {
      console.log(`    - ${u.email} (${u.role})`);
    }
    console.log(
      "[DEMO USER PROVISIONING] Complete. No passwords or hashes were logged."
    );
  } finally {
    await pool.end();
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith(SCRIPT_NAME);

if (isMain) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

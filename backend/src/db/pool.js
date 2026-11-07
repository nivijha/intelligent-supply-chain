
import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

function stripSslMode(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

const useSsl = config.dbSsl;
const rejectUnauthorized = config.dbSslRejectUnauthorized;

// SSL is controlled explicitly via DB_SSL / DB_SSL_REJECT_UNAUTHORIZED and is
// never inferred from NODE_ENV. When SSL is disabled, any sslmode parameter
// present in DATABASE_URL is stripped so it cannot force SSL on a server that
// does not support it (e.g. local Docker PostgreSQL).
export const pool = new Pool({
  connectionString: useSsl ? config.databaseUrl : stripSslMode(config.databaseUrl),
  ssl: useSsl ? { rejectUnauthorized } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  min: Number(process.env.DB_POOL_MIN || 0),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("connect", () => {
  // No-op hook reserved for connection-level telemetry.
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error.message);
});

pool.on("remove", () => {
  // No-op hook reserved for connection-removal telemetry.
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function end() {
  return pool.end();
}

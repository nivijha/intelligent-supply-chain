
import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

const isProduction = config.nodeEnv === "production";

export const pool = new Pool({
  connectionString: config.databaseUrl,
  
  ssl: isProduction
    ? { rejectUnauthorized: true }
    : false,

  max: Number(process.env.DB_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error.message);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

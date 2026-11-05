import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain" });

const users = [
  { name: "Rajesh Kumar", email: "admin@isc.gov.in", password: "admin123", role: "ADMIN" },
  { name: "Priya Sharma", email: "planner@isc.gov.in", password: "planner123", role: "PLANNER" },
  { name: "Amit Patel", email: "analyst@isc.gov.in", password: "analyst123", role: "ANALYST" },
  { name: "Harpreet Singh", email: "manager@isc.gov.in", password: "manager123", role: "WAREHOUSE_MANAGER" },
];

const nodeEnv = process.env.NODE_ENV || "development";
const allowSeedUsers = process.env.ALLOW_SEED_USERS === "true";

if (nodeEnv !== "development" && !allowSeedUsers) {
  console.error("Refusing to seed development users outside development. Set ALLOW_SEED_USERS=true to override.");
  process.exit(1);
}

async function main() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1,$2,$3,(SELECT id FROM roles WHERE name=$4))
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
      [u.name, u.email, hash, u.role]
    );
    console.log("seeded", u.email);
  }
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });

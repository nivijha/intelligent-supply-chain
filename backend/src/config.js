import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

export const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

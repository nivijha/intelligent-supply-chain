import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "..", ".env"),
});

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
console.log("========== CORS CONFIG ==========");
console.log("NODE_ENV:", config.nodeEnv);
console.log("CORS_ORIGIN:", JSON.stringify(config.corsOrigin));
console.log("=================================");

export const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").replace(
    /\/+$/,
    "",
  ),
  nodeEnv: process.env.NODE_ENV || "development",
};

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { pool } from "./db/pool.js";

import authRoutes from "./routes/auth.routes.js";
import demandRoutes from "./routes/demand.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import warehouseRoutes from "./routes/warehouses.routes.js";
import productRoutes from "./routes/products.routes.js";
import districtRoutes from "./routes/districts.routes.js";
import logisticsRoutes from "./routes/logistics.routes.js";
import recommendationRoutes from "./routes/recommendations.routes.js";
import approvalRoutes from "./routes/approvals.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "healthy", service: "backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/demand", demandRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api", logisticsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/recommendations", approvalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({ error: "Request body too large" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
});

process.on("SIGTERM", async () => {
  await pool.end();
  server.close(() => process.exit(0));
});

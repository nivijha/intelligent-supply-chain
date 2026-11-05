import axios from "axios";
import { config } from "../config.js";

const client = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: Number(process.env.ML_CLIENT_TIMEOUT || 60000),
  headers: { "Content-Type": "application/json" },
});

export async function forecastDemand({ history, horizon, districtId, productId }) {
  const { data } = await client.post("/api/v1/demand/forecast", {
    horizon,
    history,
    district_id: districtId || null,
    product_id: productId || null,
  });
  if (!data || typeof data !== "object") {
    throw new Error("Invalid ML forecast response");
  }
  return data;
}

export async function demandMetrics() {
  const { data } = await client.get("/api/v1/demand/metrics");
  return data;
}

export async function explainDemand(records, topN = 10) {
  const { data } = await client.post("/api/v1/demand/explain", { records, top_n: topN });
  if (!data || typeof data !== "object") {
    throw new Error("Invalid ML explain response");
  }
  return data;
}

export async function optimizeInventory(payload) {
  const { data } = await client.post("/api/v1/inventory/optimize", payload);
  return data;
}

export async function optimizeRoutes(payload) {
  const { data } = await client.post("/api/v1/routes/optimize", payload);
  return data;
}

import axios from "axios";
import { config } from "../config.js";

const client = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export async function forecastDemand({ history, horizon, districtId, productId }) {
  const { data } = await client.post("/api/v1/demand/forecast", {
    horizon,
    history,
    district_id: districtId || null,
    product_id: productId || null,
  });
  return data;
}

export async function demandMetrics() {
  const { data } = await client.get("/api/v1/demand/metrics");
  return data;
}

export async function explainDemand(records, topN = 10) {
  const { data } = await client.post("/api/v1/demand/explain", { records, top_n: topN });
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

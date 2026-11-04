import { pool } from "../db/pool.js";

export async function getHistoricalDemand({ districtId, productId } = {}) {
  const conditions = [];
  const params = [];
  if (districtId) { params.push(districtId); conditions.push(`district_id = $${params.length}`); }
  if (productId) { params.push(productId); conditions.push(`product_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT to_char(month, 'YYYY-MM-DD') AS month, district_id, product_id, demand_quintals, population_estimate, festival_season_flag, shortage_event_flag
     FROM historical_demand ${where} ORDER BY district_id, product_id, month`,
    params
  );
  return rows.map((r) => ({
    month: r.month,
    district_id: r.district_id,
    product_id: r.product_id,
    demand_quintals: Number(r.demand_quintals),
    population_estimate: r.population_estimate,
    festival_season_flag: r.festival_season_flag ? 1 : 0,
    shortage_event_flag: r.shortage_event_flag ? 1 : 0,
  }));
}

export async function upsertForecasts(forecasts, createdBy) {
  for (const f of forecasts) {
    await pool.query(
      `INSERT INTO forecasts (district_id, product_id, forecast_month, predicted_demand_quintals, model_version, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (district_id, product_id, forecast_month, model_version) DO UPDATE
       SET predicted_demand_quintals = EXCLUDED.predicted_demand_quintals, created_at = NOW()`,
      [f.district_id, f.product_id, f.forecast_month, f.predicted_demand_quintals, f.model_version, createdBy]
    );
  }
}

export async function getForecasts({ districtId, productId } = {}) {
  const conditions = [];
  const params = [];
  if (districtId) { params.push(districtId); conditions.push(`district_id = $${params.length}`); }
  if (productId) { params.push(productId); conditions.push(`product_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT district_id, product_id, to_char(forecast_month, 'YYYY-MM-DD') AS forecast_month, predicted_demand_quintals, model_version, created_at
     FROM forecasts ${where} ORDER BY forecast_month, district_id, product_id`,
    params
  );
  return rows.map((r) => ({
    district_id: r.district_id,
    product_id: r.product_id,
    forecast_month: r.forecast_month,
    predicted_demand_quintals: Number(r.predicted_demand_quintals),
    model_version: r.model_version,
    created_at: r.created_at,
  }));
}

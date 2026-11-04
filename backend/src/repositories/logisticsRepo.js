import { pool } from "../db/pool.js";

export async function getShipments({ status, warehouseId, districtId } = {}) {
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  if (warehouseId) { params.push(warehouseId); conditions.push(`warehouse_id = $${params.length}`); }
  if (districtId) { params.push(districtId); conditions.push(`district_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM shipments ${where} ORDER BY created_at DESC LIMIT 500`,
    params
  );
  return rows;
}

export async function getRouteCandidates({ shipmentIds } = {}) {
  if (shipmentIds && shipmentIds.length) {
    const { rows } = await pool.query(
      `SELECT * FROM route_candidates WHERE shipment_id = ANY($1::text[])`,
      [shipmentIds]
    );
    return rows;
  }
  const { rows } = await pool.query(`SELECT * FROM route_candidates`);
  return rows;
}

export async function getVehicles() {
  const { rows } = await pool.query(`SELECT * FROM vehicles ORDER BY vehicle_id`);
  return rows;
}

export async function createShipment(shipment) {
  const { rows } = await pool.query(
    `INSERT INTO shipments (shipment_id, order_date, warehouse_id, district_id, product_id, quantity_quintals, vehicle_id, distance_km, travel_time_hours, transport_cost_inr, status, recommendation_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      shipment.shipment_id,
      shipment.order_date,
      shipment.warehouse_id,
      shipment.district_id,
      shipment.product_id,
      shipment.quantity_quintals,
      shipment.vehicle_id,
      shipment.distance_km,
      shipment.travel_time_hours,
      shipment.transport_cost_inr,
      shipment.status || "PLANNED",
      shipment.recommendation_id || null,
    ]
  );
  return rows[0];
}

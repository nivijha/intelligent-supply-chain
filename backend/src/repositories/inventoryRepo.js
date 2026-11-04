import { pool } from "../db/pool.js";

export async function getInventory({ warehouseId, productId } = {}) {
  const conditions = [];
  const params = [];
  if (warehouseId) { params.push(warehouseId); conditions.push(`warehouse_id = $${params.length}`); }
  if (productId) { params.push(productId); conditions.push(`product_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT i.*, w.warehouse_name FROM inventory i
     LEFT JOIN warehouses w ON w.warehouse_id = i.warehouse_id
     ${where} ORDER BY i.warehouse_id, i.product_id`,
    params
  );
  return rows;
}

export async function getWarehouseDistricts() {
  const { rows } = await pool.query(`SELECT warehouse_id, district_id FROM warehouse_districts`);
  return rows;
}

export async function getWarehouses() {
  const { rows } = await pool.query(`SELECT * FROM warehouses ORDER BY warehouse_id`);
  return rows;
}

export async function getWarehouseById(id) {
  const { rows } = await pool.query(`SELECT * FROM warehouses WHERE warehouse_id = $1`, [id]);
  return rows[0] || null;
}

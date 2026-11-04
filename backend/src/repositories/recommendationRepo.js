import { pool } from "../db/pool.js";

export async function listRecommendations({ status, priority, type, search } = {}) {
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  if (type) { params.push(type); conditions.push(`recommendation_type = $${params.length}`); }
  if (search) { params.push(`%${search}%`); conditions.push(`(justification ILIKE $${params.length} OR CAST(id AS TEXT) ILIKE $${params.length})`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM recommendations ${where} ORDER BY created_at DESC LIMIT 500`,
    params
  );
  return rows;
}

export async function getRecommendationById(id) {
  const { rows } = await pool.query(`SELECT * FROM recommendations WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createRecommendation(rec) {
  const { rows } = await pool.query(
    `INSERT INTO recommendations (recommendation_type, district_id, product_id, warehouse_id, from_warehouse_id, to_warehouse_id, quantity_quintals, estimated_cost_inr, justification, status, model_version, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      rec.recommendation_type,
      rec.district_id || null,
      rec.product_id || null,
      rec.warehouse_id || null,
      rec.from_warehouse_id || null,
      rec.to_warehouse_id || null,
      rec.quantity_quintals || null,
      rec.estimated_cost_inr || null,
      rec.justification || null,
      rec.status || "PENDING",
      rec.model_version || null,
      rec.created_by || null,
    ]
  );
  return rows[0];
}

export async function updateRecommendationStatus(id, status, userId, reason) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT status FROM recommendations WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (!rows.length) {
      await client.query("ROLLBACK");
      return null;
    }
    if (!["PENDING"].includes(rows[0].status) && status !== rows[0].status) {
      // allow only from PENDING
    }
    if (rows[0].status !== "PENDING") {
      await client.query("ROLLBACK");
      const err = new Error("Recommendation is not in PENDING state");
      err.code = "INVALID_STATE";
      throw err;
    }
    const reviewedAt = status === "APPROVED" || status === "REJECTED" ? new Date() : null;
    const { rows: updated } = await client.query(
      `UPDATE recommendations
       SET status = $1, reviewed_by = $2, reviewed_at = $3, rejection_reason = $4
       WHERE id = $5 RETURNING *`,
      [status, userId, reviewedAt, reason || null, id]
    );
    await client.query(
      `INSERT INTO recommendation_approvals (recommendation_id, user_id, decision, reason)
       VALUES ($1,$2,$3,$4)`,
      [id, userId, status === "APPROVED" ? "APPROVED" : "REJECTED", reason || null]
    );
    await client.query("COMMIT");
    return updated[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

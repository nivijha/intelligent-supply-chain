import { pool } from "../db/pool.js";

export async function logAudit({ userId, action, entityType, entityId, metadata, ipAddress }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId || null, action, entityType, String(entityId), metadata ? JSON.stringify(metadata) : null, ipAddress || null]
  );
}

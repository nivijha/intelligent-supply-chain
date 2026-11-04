import { Router } from "express";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { pool } from "../db/pool.js";
import { ROLES } from "../middleware/rbac.js";

const router = Router();

router.get("/", authenticate, requireRoles(ROLES.ADMIN, ROLES.ANALYST), async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`);
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

export default router;

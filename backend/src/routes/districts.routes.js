import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM districts ORDER BY district_id`);
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

export default router;

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/summary", authenticate, async (req, res, next) => {
  try {
    const counts = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS c FROM inventory"),
      pool.query("SELECT COUNT(*)::int AS c FROM recommendations WHERE status='PENDING'"),
      pool.query("SELECT COUNT(*)::int AS c FROM shipments"),
      pool.query("SELECT COUNT(*)::int AS c FROM warehouses"),
    ]);
    res.json({
      inventory_items: counts[0].rows[0].c,
      pending_recommendations: counts[1].rows[0].c,
      shipments: counts[2].rows[0].c,
      warehouses: counts[3].rows[0].c,
    });
  } catch (err) { next(err); }
});

export default router;

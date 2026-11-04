import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as inventoryRepo from "../repositories/inventoryRepo.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const rows = await inventoryRepo.getWarehouses();
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const row = await inventoryRepo.getWarehouseById(req.params.id);
    if (!row) return res.status(404).json({ error: "Warehouse not found" });
    res.json(row);
  } catch (err) { next(err); }
});

export default router;

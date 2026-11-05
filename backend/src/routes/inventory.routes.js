import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as inventoryRepo from "../repositories/inventoryRepo.js";
import * as demandRepo from "../repositories/demandRepo.js";
import * as mlClient from "../services/mlClient.js";
import { ROLES } from "../middleware/rbac.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const rows = await inventoryRepo.getInventory({ warehouseId: req.query.warehouse_id, productId: req.query.product_id });
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

const optimizeSchema = z.object({
  warehouse_id: z.string().max(64).optional(),
  product_id: z.string().max(64).optional(),
  horizon: z.number().int().min(1).max(12).default(1),
});

router.post("/optimize", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(optimizeSchema), async (req, res, next) => {
  try {
    const { warehouse_id, product_id, horizon } = req.validated;
    const inventoryRows = await inventoryRepo.getInventory({ warehouseId: warehouse_id, productId: product_id });
    if (!inventoryRows.length) return res.status(400).json({ error: "No inventory for filters" });
    const history = await demandRepo.getHistoricalDemand({ productId: product_id });
    const r = await mlClient.forecastDemand({ history, horizon, productId: product_id });
    const forecastRows = r.data;
    await demandRepo.upsertForecasts(forecastRows, req.user.id);
    const warehouses = await inventoryRepo.getWarehouses();
    const warehouseDistricts = await inventoryRepo.getWarehouseDistricts();
    const result = await mlClient.optimizeInventory({
      inventory: inventoryRows.map((r) => ({
        warehouse_id: r.warehouse_id,
        product_id: r.product_id,
        on_hand_quintals: Number(r.on_hand_quintals),
        reserved_quintals: Number(r.reserved_quintals),
        incoming_quintals: Number(r.incoming_quintals || 0),
        reorder_lead_time_days: r.reorder_lead_time_days,
        safety_stock_quintals: Number(r.safety_stock_quintals),
        unit_procurement_cost_inr: Number(r.unit_procurement_cost_inr),
        expiry_risk_score: r.expiry_risk_score !== null ? Number(r.expiry_risk_score) : null,
      })),
      forecast: forecastRows.map((r) => ({
        district_id: r.district_id,
        product_id: r.product_id,
        forecast_month: r.forecast_month || r.forecast_month,
        predicted_demand_quintals: Number(r.predicted_demand_quintals),
      })),
      warehouse_districts: warehouseDistricts,
      warehouses: warehouses.map((w) => ({ warehouse_id: w.warehouse_id, capacity_quintals: Number(w.capacity_quintals), district_id: w.location_district_id })),
    });
    await logAudit({ userId: req.user.id, action: "INVENTORY_OPTIMIZE", entityType: "INVENTORY", entityId: warehouse_id || "ALL", metadata: { product_id, count: result.count }, ipAddress: req.ip });
    res.json(result);
  } catch (err) { next(err); }
});

export default router;

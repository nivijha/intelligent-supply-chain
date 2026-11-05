import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as recommendationRepo from "../repositories/recommendationRepo.js";
import * as inventoryRepo from "../repositories/inventoryRepo.js";
import * as demandRepo from "../repositories/demandRepo.js";
import * as mlClient from "../services/mlClient.js";
import { ROLES } from "../middleware/rbac.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const rows = await recommendationRepo.listRecommendations({ status: req.query.status, type: req.query.type, search: req.query.search });
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const row = await recommendationRepo.getRecommendationById(req.params.id);
    if (!row) return res.status(404).json({ error: "Recommendation not found" });
    res.json(row);
  } catch (err) { next(err); }
});

const generateSchema = z.object({
  district_id: z.string().max(64).optional(),
  product_id: z.string().max(64).optional(),
  horizon: z.number().int().min(1).max(12).default(1),
});

router.post("/generate", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER), validate(generateSchema), async (req, res, next) => {
  try {
    const { district_id, product_id, horizon } = req.validated;
    const allInventory = await inventoryRepo.getInventory({ productId: product_id });
    const warehouseDistricts = await inventoryRepo.getWarehouseDistricts();
    const servingWarehouses = district_id
      ? new Set(warehouseDistricts.filter((w) => w.district_id === district_id).map((w) => w.warehouse_id))
      : null;
    const inventoryRows = servingWarehouses
      ? allInventory.filter((r) => servingWarehouses.has(r.warehouse_id))
      : allInventory;
    if (!inventoryRows.length) return res.status(400).json({ error: "No inventory for filters" });
    const history = await demandRepo.getHistoricalDemand({ districtId: district_id, productId: product_id });
    const forecastResult = await mlClient.forecastDemand({
      history,
      horizon,
      districtId: district_id,
      productId: product_id,
    });
    const usedForecasts = forecastResult.data;
    await demandRepo.upsertForecasts(usedForecasts, req.user.id);
    const warehouses = await inventoryRepo.getWarehouses();
    const optimization = await mlClient.optimizeInventory({
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
      forecast: usedForecasts.map((r) => ({
        district_id: r.district_id,
        product_id: r.product_id,
        forecast_month: r.forecast_month,
        predicted_demand_quintals: Number(r.predicted_demand_quintals),
      })),
      warehouse_districts: warehouseDistricts,
      warehouses: warehouses.map((w) => ({ warehouse_id: w.warehouse_id, capacity_quintals: Number(w.capacity_quintals), district_id: w.location_district_id })),
    });

    const created = [];
    for (const row of optimization.data) {
      if (row.stock_status !== "REORDER") continue;
      const rec = await recommendationRepo.createRecommendation({
        recommendation_type: "REPLENISHMENT",
        district_id: district_id || null,
        product_id: row.product_id,
        warehouse_id: row.warehouse_id,
        quantity_quintals: row.recommended_order_quintals,
        estimated_cost_inr: row.estimated_order_cost_inr,
        justification: `Available stock ${row.available_stock_quintals} is below reorder point ${row.reorder_point_quintals}.`,
        status: "PENDING",
        model_version: usedForecasts[0]?.model_version || null,
        created_by: req.user.id,
      });
      created.push(rec);
    }
    await logAudit({ userId: req.user.id, action: "GENERATE_RECOMMENDATIONS", entityType: "RECOMMENDATION", entityId: "BATCH", metadata: { count: created.length }, ipAddress: req.ip });
    res.status(201).json({ count: created.length, data: created });
  } catch (err) { next(err); }
});

const statusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "EXECUTED", "EXPIRED"]),
  reason: z.string().max(1000).optional(),
});

router.patch("/:id/status", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(statusSchema), async (req, res, next) => {
  try {
    const updated = await recommendationRepo.updateRecommendationStatus(req.params.id, req.validated.status, req.user.id, req.validated.reason);
    if (!updated) return res.status(404).json({ error: "Recommendation not found" });
    await logAudit({ userId: req.user.id, action: `RECOMMENDATION_${req.validated.status}`, entityType: "RECOMMENDATION", entityId: req.params.id, metadata: { reason: req.validated.reason }, ipAddress: req.ip });
    res.json(updated);
  } catch (err) {
    if (err.code === "INVALID_STATE") return res.status(409).json({ error: err.message });
    next(err);
  }
});

export default router;

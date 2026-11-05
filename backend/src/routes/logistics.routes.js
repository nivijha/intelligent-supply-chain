import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as logisticsRepo from "../repositories/logisticsRepo.js";
import * as mlClient from "../services/mlClient.js";
import { ROLES } from "../middleware/rbac.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

router.get("/shipments", authenticate, async (req, res, next) => {
  try {
    const rows = await logisticsRepo.getShipments({ status: req.query.status, warehouseId: req.query.warehouse_id, districtId: req.query.district_id });
    res.json({ count: rows.length, data: rows });
  } catch (err) { next(err); }
});

const optimizeSchema = z.object({
  shipment_ids: z.array(z.string().max(64)).max(1000).optional(),
});

router.post("/routes/optimize", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(optimizeSchema), async (req, res, next) => {
  try {
    const rawCandidates = await logisticsRepo.getRouteCandidates({ shipmentIds: req.validated.shipment_ids });
    if (!rawCandidates.length) return res.status(400).json({ error: "No route candidates available" });
    const candidates = rawCandidates.map((r) => ({
      ...r,
      quantity_quintals: Number(r.quantity_quintals),
      distance_km_simulated: r.distance_km_simulated !== null ? Number(r.distance_km_simulated) : null,
      estimated_time_hours_simulated: r.estimated_time_hours_simulated !== null ? Number(r.estimated_time_hours_simulated) : null,
      estimated_cost_inr_simulated: r.estimated_cost_inr_simulated !== null ? Number(r.estimated_cost_inr_simulated) : null,
      available_stock_quintals: r.available_stock_quintals !== null ? Number(r.available_stock_quintals) : null,
      stock_shortfall_quintals: r.stock_shortfall_quintals !== null ? Number(r.stock_shortfall_quintals) : null,
      vehicle_capacity_quintals: r.vehicle_capacity_quintals !== null ? Number(r.vehicle_capacity_quintals) : null,
      capacity_violation_quintals: r.capacity_violation_quintals !== null ? Number(r.capacity_violation_quintals) : null,
    }));
    const vehicles = (await logisticsRepo.getVehicles()).map((v) => ({
      ...v,
      capacity_quintals: Number(v.capacity_quintals),
      availability_flag: v.availability_flag === true || v.availability_flag === "t" || v.availability_flag === 1,
    }));
    const inventoryRows = (await (await import("../db/pool.js")).pool.query(`SELECT * FROM inventory`)).rows.map((r) => ({
      ...r,
      on_hand_quintals: Number(r.on_hand_quintals),
      reserved_quintals: Number(r.reserved_quintals),
    }));
    const result = await mlClient.optimizeRoutes({ candidates, vehicles, inventory: inventoryRows });
    await logAudit({ userId: req.user.id, action: "ROUTE_OPTIMIZE", entityType: "SHIPMENT", entityId: "BATCH", metadata: result.summary, ipAddress: req.ip });
    res.json(result);
  } catch (err) { next(err); }
});

const createShipmentSchema = z.object({
  shipment_id: z.string().min(1).max(64),
  order_date: z.string().max(32).optional(),
  warehouse_id: z.string().max(64),
  district_id: z.string().max(64),
  product_id: z.string().max(64),
  quantity_quintals: z.number().positive(),
  vehicle_id: z.string().max(64).optional(),
  distance_km: z.number().optional(),
  travel_time_hours: z.number().optional(),
  transport_cost_inr: z.number().optional(),
  recommendation_id: z.string().uuid().optional(),
});

router.post("/shipments", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(createShipmentSchema), async (req, res, next) => {
  try {
    const row = await logisticsRepo.createShipment(req.validated);
    await logAudit({ userId: req.user.id, action: "CREATE_SHIPMENT", entityType: "SHIPMENT", entityId: row.shipment_id, metadata: req.validated, ipAddress: req.ip });
    res.status(201).json(row);
  } catch (err) { next(err); }
});

export default router;

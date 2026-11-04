import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as demandRepo from "../repositories/demandRepo.js";
import * as mlClient from "../services/mlClient.js";
import { ROLES } from "../middleware/rbac.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

const forecastSchema = z.object({
  district_id: z.string().optional(),
  product_id: z.string().optional(),
  horizon: z.number().int().min(1).max(12).default(3),
  persist: z.boolean().default(true),
});

router.post("/forecast", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.ANALYST), validate(forecastSchema), async (req, res, next) => {
  try {
    const { district_id, product_id, horizon, persist } = req.validated;
    const history = await demandRepo.getHistoricalDemand({ districtId: district_id, productId: product_id });
    if (!history.length) return res.status(400).json({ error: "No historical demand for filters" });
    const result = await mlClient.forecastDemand({ history, horizon, districtId: district_id, productId: product_id });
    if (persist) {
      await demandRepo.upsertForecasts(result.data, req.user.id);
    }
    await logAudit({ userId: req.user.id, action: "GENERATE_FORECAST", entityType: "FORECAST", entityId: `${district_id || "ALL"}:${product_id || "ALL"}`, metadata: { horizon, count: result.count }, ipAddress: req.ip });
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/forecasts", authenticate, async (req, res, next) => {
  try {
    const forecasts = await demandRepo.getForecasts({ districtId: req.query.district_id, productId: req.query.product_id });
    res.json({ count: forecasts.length, data: forecasts });
  } catch (err) { next(err); }
});

router.get("/history", authenticate, async (req, res, next) => {
  try {
    const history = await demandRepo.getHistoricalDemand({ districtId: req.query.district_id, productId: req.query.product_id });
    res.json({ count: history.length, data: history });
  } catch (err) { next(err); }
});

router.get("/metrics", authenticate, async (req, res, next) => {
  try {
    const metrics = await mlClient.demandMetrics();
    res.json(metrics);
  } catch (err) { next(err); }
});

const explainSchema = z.object({
  records: z.array(z.record(z.any())).min(1),
  top_n: z.number().int().min(1).max(50).default(10),
});

router.post("/explain", authenticate, validate(explainSchema), async (req, res, next) => {
  try {
    const result = await mlClient.explainDemand(req.validated.records, req.validated.top_n);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;

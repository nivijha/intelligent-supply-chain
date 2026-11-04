import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as recommendationRepo from "../repositories/recommendationRepo.js";
import { ROLES } from "../middleware/rbac.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

const schema = z.object({ reason: z.string().optional() });

router.post("/:id/approve", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(schema), async (req, res, next) => {
  try {
    const updated = await recommendationRepo.updateRecommendationStatus(req.params.id, "APPROVED", req.user.id, req.validated.reason);
    if (!updated) return res.status(404).json({ error: "Recommendation not found" });
    await logAudit({ userId: req.user.id, action: "RECOMMENDATION_APPROVED", entityType: "RECOMMENDATION", entityId: req.params.id, ipAddress: req.ip });
    res.json(updated);
  } catch (err) {
    if (err.code === "INVALID_STATE") return res.status(409).json({ error: err.message });
    next(err);
  }
});

router.post("/:id/reject", authenticate, requireRoles(ROLES.ADMIN, ROLES.PLANNER, ROLES.WAREHOUSE_MANAGER), validate(schema), async (req, res, next) => {
  try {
    const updated = await recommendationRepo.updateRecommendationStatus(req.params.id, "REJECTED", req.user.id, req.validated.reason);
    if (!updated) return res.status(404).json({ error: "Recommendation not found" });
    await logAudit({ userId: req.user.id, action: "RECOMMENDATION_REJECTED", entityType: "RECOMMENDATION", entityId: req.params.id, metadata: { reason: req.validated.reason }, ipAddress: req.ip });
    res.json(updated);
  } catch (err) {
    if (err.code === "INVALID_STATE") return res.status(409).json({ error: err.message });
    next(err);
  }
});

export default router;

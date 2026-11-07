import { Router } from "express";
import { loginSchema, registerSchema } from "../validators/auth.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { ROLES } from "../middleware/rbac.js";
import * as userRepo from "../repositories/userRepo.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validated;

    // Privileged roles (anything other than ANALYST) require
    // authentication and administrator authorization. Public
    // registration can only create ANALYST accounts.
    if (role !== ROLES.ANALYST) {
      const header = req.headers.authorization || "";
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Missing or invalid authorization header" });
      }
      try {
        const payload = verifyToken(token);
        if (payload.role !== ROLES.ADMIN) {
          return res.status(403).json({ error: "Forbidden: only administrators can create privileged accounts" });
        }
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    const existing = await userRepo.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const user = await userRepo.createUser({ name, email, password, roleName: role });
    const token = signToken({ id: user.id, email: user.email, role_name: role });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (err) { next(err); }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    const user = await userRepo.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await userRepo.verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user);
    await logAudit({ userId: user.id, action: "LOGIN", entityType: "USER", entityId: user.id, ipAddress: req.ip });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role_name } });
  } catch (err) { next(err); }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await userRepo.findUserById(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
});

export default router;

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  role: z.enum(["ADMIN", "PLANNER", "WAREHOUSE_MANAGER", "ANALYST"]).default("ANALYST"),
});

import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  normalizeEmail,
  requireProductionOptIn,
  provisionUsers,
  ensureRolesExist,
  DEMO_USERS,
  BCRYPT_COST,
} from "../scripts/seedDemoUsers.js";

const backendDir = path.resolve(process.cwd());

test("normalizeEmail trims whitespace and lowercases", () => {
  assert.equal(normalizeEmail("  Admin@Example.COM  "), "admin@example.com");
  assert.equal(normalizeEmail("planner@isc.gov.in"), "planner@isc.gov.in");
  assert.equal(normalizeEmail("USER@DOMAIN.COM"), "user@domain.com");
});

test("requireProductionOptIn allows development without opt-in", () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origAllow = process.env.ALLOW_DEMO_USER_SEED;
  process.env.NODE_ENV = "development";
  delete process.env.ALLOW_DEMO_USER_SEED;
  assert.doesNotThrow(() => requireProductionOptIn());
  process.env.NODE_ENV = origNodeEnv;
  if (origAllow === undefined) delete process.env.ALLOW_DEMO_USER_SEED;
  else process.env.ALLOW_DEMO_USER_SEED = origAllow;
});

test("requireProductionOptIn throws in production without explicit opt-in", () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origAllow = process.env.ALLOW_DEMO_USER_SEED;
  process.env.NODE_ENV = "production";
  delete process.env.ALLOW_DEMO_USER_SEED;
  assert.throws(() => requireProductionOptIn(), /Refusing to provision/);
  process.env.NODE_ENV = origNodeEnv;
  if (origAllow === undefined) delete process.env.ALLOW_DEMO_USER_SEED;
  else process.env.ALLOW_DEMO_USER_SEED = origAllow;
});

test("requireProductionOptIn allows production with ALLOW_DEMO_USER_SEED=true", () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origAllow = process.env.ALLOW_DEMO_USER_SEED;
  process.env.NODE_ENV = "production";
  process.env.ALLOW_DEMO_USER_SEED = "true";
  assert.doesNotThrow(() => requireProductionOptIn());
  process.env.NODE_ENV = origNodeEnv;
  if (origAllow === undefined) delete process.env.ALLOW_DEMO_USER_SEED;
  else process.env.ALLOW_DEMO_USER_SEED = origAllow;
});

test("BCRYPT_COST is 10", () => {
  assert.equal(BCRYPT_COST, 10);
});

test("DEMO_USERS contains all four expected accounts", () => {
  const emails = DEMO_USERS.map((u) => u.email);
  assert.ok(emails.includes("admin@isc.gov.in"));
  assert.ok(emails.includes("planner@isc.gov.in"));
  assert.ok(emails.includes("analyst@isc.gov.in"));
  assert.ok(emails.includes("manager@isc.gov.in"));

  const roles = DEMO_USERS.map((u) => u.role);
  assert.ok(roles.includes("ADMIN"));
  assert.ok(roles.includes("PLANNER"));
  assert.ok(roles.includes("ANALYST"));
  assert.ok(roles.includes("WAREHOUSE_MANAGER"));
});

test("provisionUsers creates missing users and returns created results", async () => {
  const mockPool = {
    query: async (text) => {
      if (text.includes("INSERT INTO users")) {
        return { rows: [{ id: "uuid-1", name: "Priya Sharma", email: "planner@isc.gov.in" }] };
      }
      return { rows: [{ id: 1 }] };
    },
  };

  const u = DEMO_USERS[1];
  const results = await provisionUsers(mockPool, [u]);

  assert.equal(results.created.length, 1);
  assert.equal(results.skipped.length, 0);
  assert.equal(results.created[0].email, u.email.toLowerCase().trim());
  assert.equal(results.created[0].role, "PLANNER");
});

test("provisionUsers skips existing users (idempotent)", async () => {
  const mockPool = {
    query: async (text) => {
      if (text.includes("INSERT INTO users")) {
        // ON CONFLICT (email) DO NOTHING returns no rows when skipped
        return { rows: [] };
      }
      return { rows: [{ id: 1 }] };
    },
  };

  const u = DEMO_USERS[0];
  const results = await provisionUsers(mockPool, [u]);

  assert.equal(results.created.length, 0);
  assert.equal(results.skipped.length, 1);
  assert.equal(results.skipped[0].email, u.email.toLowerCase().trim());
  assert.equal(results.skipped[0].role, "ADMIN");
});

test("provisionUsers stores bcrypt hash with cost 10 and password verifies", async () => {
  let capturedHash = null;
  const mockPool = {
    query: async (text, params) => {
      if (text.includes("INSERT INTO users")) {
        capturedHash = params[2];
        return { rows: [{ id: "uuid-1" }] };
      }
      return { rows: [{ id: 1 }] };
    },
  };

  const u = DEMO_USERS[2];
  await provisionUsers(mockPool, [u]);

  assert.ok(capturedHash, "Hash should be captured from query params");
  assert.ok(
    capturedHash.startsWith("$2a$") ||
      capturedHash.startsWith("$2b$") ||
      capturedHash.startsWith("$2y$"),
    `Hash should be a bcrypt hash, got: ${capturedHash.substring(0, 4)}`
  );

  // The generated password must work with the existing verifyPassword function
  const match = await bcrypt.compare(u.password, capturedHash);
  assert.equal(match, true, "Demo password must verify against stored hash");

  // A wrong password must not verify
  const noMatch = await bcrypt.compare("wrongpassword", capturedHash);
  assert.equal(noMatch, false, "Wrong password must not verify");
});

test("provisionUsers normalizes email before insert", async () => {
  let capturedEmail = null;
  const mockPool = {
    query: async (text, params) => {
      if (text.includes("INSERT INTO users")) {
        capturedEmail = params[1];
        return { rows: [{ id: "uuid-1" }] };
      }
      return { rows: [{ id: 1 }] };
    },
  };

  const u = { ...DEMO_USERS[0], email: "  ADMIN@ISC.GOV.IN  " };
  await provisionUsers(mockPool, [u]);

  assert.equal(capturedEmail, "admin@isc.gov.in", "Email should be normalized to lowercase, trimmed");
});

test("ensureRolesExist throws when a required role is missing", async () => {
  const mockPool = {
    query: async () => ({ rows: [] }),
  };

  await assert.rejects(
    ensureRolesExist(mockPool, ["ADMIN"]),
    /does not exist in the database/
  );
});

test("ensureRolesExist succeeds when all required roles exist", async () => {
  const mockPool = {
    query: async () => ({ rows: [{ id: 1 }] }),
  };

  await assert.doesNotReject(
    ensureRolesExist(mockPool, ["ADMIN", "PLANNER", "ANALYST", "WAREHOUSE_MANAGER"])
  );
});

test("seedDemoUsers refuses production without explicit opt-in (spawnSync)", () => {
  const result = spawnSync(process.execPath, ["scripts/seedDemoUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "production",
      ALLOW_DEMO_USER_SEED: "",
      DATABASE_URL: "postgresql://invalid:invalid@localhost:5433/intelligent_supply_chain",
    },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to provision/);
});

test("seedDemoUsers refuses missing DATABASE_URL", () => {
  const result = spawnSync(process.execPath, ["scripts/seedDemoUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "development",
      ALLOW_DEMO_USER_SEED: "true",
      DATABASE_URL: "",
    },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DATABASE_URL environment variable is required/);
});

test("seedDemoUsers allows development seeding without opt-in (spawnSync)", () => {
  const result = spawnSync(process.execPath, ["scripts/seedDemoUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
});

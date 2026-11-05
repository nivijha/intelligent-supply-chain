import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

const backendDir = path.resolve(process.cwd());

test("seedUsers refuses production without explicit opt-in", () => {
  const result = spawnSync(process.execPath, ["scripts/seedUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "production",
      ALLOW_SEED_USERS: "",
      DATABASE_URL: "postgresql://invalid:invalid@localhost:5433/intelligent_supply_chain",
    },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to seed/);
});

test("seedUsers allows development seeding", () => {
  const result = spawnSync(process.execPath, ["scripts/seedUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
});

test("seedUsers allows non-development with explicit opt-in", () => {
  const result = spawnSync(process.execPath, ["scripts/seedUsers.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "test",
      ALLOW_SEED_USERS: "true",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
});

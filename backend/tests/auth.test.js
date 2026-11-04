import { test } from "node:test";
import assert from "node:assert/strict";
import { login } from "./helpers.js";

test("planner can login and fetch profile", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const res = await fetch("http://127.0.0.1:3001/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.email, "planner@isc.gov.in");
});

test("invalid login returns 401", async () => {
  const res = await fetch("http://127.0.0.1:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "planner@isc.gov.in", password: "wrong" }),
  });
  assert.equal(res.status, 401);
});

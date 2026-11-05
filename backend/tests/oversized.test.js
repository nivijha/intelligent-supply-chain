import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("oversized request body returns 413", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const largeValue = "x".repeat(3 * 1024 * 1024);
  const res = await fetch("http://127.0.0.1:3001/api/demand/forecast", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ history: [{ note: largeValue }], horizon: 1 }),
  });
  assert.equal(res.status, 413);
});

test("oversized collection is rejected by validation", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const records = Array.from({ length: 1001 }, () => ({ value: 1 }));
  const res = await fetch("http://127.0.0.1:3001/api/demand/explain", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ records, top_n: 1 }),
  });
  assert.equal(res.status, 400);
});

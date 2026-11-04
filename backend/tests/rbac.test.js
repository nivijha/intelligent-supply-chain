import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("analyst cannot generate recommendations", async () => {
  const token = await login("analyst@isc.gov.in", "analyst123");
  const res = await fetch("http://127.0.0.1:3001/api/recommendations/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ product_id: "PDS-RICE", horizon: 1 }),
  });
  assert.equal(res.status, 403);
});

test("planner can generate recommendations", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const res = await fetch("http://127.0.0.1:3001/api/recommendations/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ district_id: "D001", product_id: "PDS-RICE", horizon: 1 }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(Array.isArray(data.data));
});

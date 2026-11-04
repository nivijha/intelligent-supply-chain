import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("forecast validation rejects invalid horizon", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const res = await fetch("http://127.0.0.1:3001/api/demand/forecast", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ product_id: "PDS-RICE", horizon: 0 }),
  });
  assert.equal(res.status, 400);
});

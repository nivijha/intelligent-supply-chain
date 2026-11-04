import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("demand metrics proxy works", async () => {
  const token = await login("analyst@isc.gov.in", "analyst123");
  const res = await fetch("http://127.0.0.1:3001/api/demand/metrics", {
    headers: authHeaders(token),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.metrics?.random_forest);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("end-to-end demand to route flow", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  // forecast
  let res = await fetch("http://127.0.0.1:3001/api/demand/forecast", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ district_id: "D001", product_id: "PDS-RICE", horizon: 1, persist: true }),
  });
  assert.equal(res.status, 200);

  // generate recommendations
  res = await fetch("http://127.0.0.1:3001/api/recommendations/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ district_id: "D001", product_id: "PDS-RICE", horizon: 1 }),
  });
  assert.equal(res.status, 201);
  const recData = await res.json();
  const rec = (recData.data || [])[0];
  if (rec) {
    // approve
    res = await fetch(`http://127.0.0.1:3001/api/recommendations/${rec.id}/approve`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ reason: "pipeline test" }),
    });
    assert.equal(res.status, 200);
  }

  // route optimize existing shipment
  res = await fetch("http://127.0.0.1:3001/api/routes/optimize", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ shipment_ids: ["SHP000001"] }),
  });
  assert.equal(res.status, 200);
  const routeData = await res.json();
  assert.equal(routeData.summary.feasible_shipments, 1);
});

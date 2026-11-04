import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("concurrent approval attempts allow only one", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  // generate one recommendation
  const gen = await fetch("http://127.0.0.1:3001/api/recommendations/generate", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ district_id: "D001", product_id: "PDS-RICE", horizon: 1 }),
  });
  const genData = await gen.json();
  const rec = (genData.data || [])[0];
  if (!rec) return;
  const id = rec.id;

  const [a, b] = await Promise.all([
    fetch(`http://127.0.0.1:3001/api/recommendations/${id}/approve`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ reason: "first" }),
    }),
    fetch(`http://127.0.0.1:3001/api/recommendations/${id}/approve`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ reason: "second" }),
    }),
  ]);

  const statuses = [a.status, b.status].sort();
  // one 200, one 409
  assert.deepEqual(statuses, [200, 409]);
});

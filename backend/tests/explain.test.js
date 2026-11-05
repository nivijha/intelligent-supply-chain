import { test } from "node:test";
import assert from "node:assert/strict";
import { login, authHeaders } from "./helpers.js";

test("explain endpoint returns contributions for raw history", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const historyRes = await fetch("http://127.0.0.1:3001/api/demand/history?product_id=PDS-RICE", {
    headers: authHeaders(token),
  });
  const history = await historyRes.json();
  const records = (history.data || []).slice(-13);
  const res = await fetch("http://127.0.0.1:3001/api/demand/explain", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ records, top_n: 3 }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.count > 0);
  assert.ok(Array.isArray(data.data[0].contributions));
  assert.equal(data.data[0].contributions.length, 3);
});

test("explain endpoint rejects empty records", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const res = await fetch("http://127.0.0.1:3001/api/demand/explain", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ records: [], top_n: 3 }),
  });
  assert.equal(res.status, 400);
});

test("explain endpoint rejects insufficient history", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const historyRes = await fetch("http://127.0.0.1:3001/api/demand/history?product_id=PDS-RICE", {
    headers: authHeaders(token),
  });
  const history = await historyRes.json();
  const records = (history.data || []).slice(-1);
  const res = await fetch("http://127.0.0.1:3001/api/demand/explain", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ records, top_n: 3 }),
  });
  assert.equal(res.status, 400);
});

test("explain endpoint rejects malformed records", async () => {
  const token = await login("planner@isc.gov.in", "planner123");
  const res = await fetch("http://127.0.0.1:3001/api/demand/explain", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ records: [{ foo: "bar" }], top_n: 3 }),
  });
  assert.equal(res.status, 400);
});

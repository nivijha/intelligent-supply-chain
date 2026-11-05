import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

const BACKEND_DIR = path.resolve(process.cwd());
const MOCK_PORT = 8011;
const BACKEND_PORT = 3011;

function waitFor(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {}
      if (Date.now() - start > timeoutMs) return reject(new Error(`Timed out waiting for ${url}`));
      setTimeout(poll, 500);
    };
    poll();
  });
}

test("upstream ML failures are mapped safely", async () => {
  let scenario = "500";
  const mockServer = http.createServer(async (req, res) => {
    if (req.url === "/__control") {
      let body = "";
      for await (const chunk of req) body += chunk;
      scenario = JSON.parse(body || "{}").scenario || scenario;
      res.statusCode = 200;
      res.end("ok");
      return;
    }
    if (req.url === "/api/v1/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "healthy" }));
      return;
    }
    if (scenario === "500") {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ detail: "boom" }));
      return;
    }
    if (scenario === "503") {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ detail: "unavailable" }));
      return;
    }
    if (scenario === "malformed") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end("{not json");
      return;
    }
    if (scenario === "timeout") {
      setTimeout(() => {
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
      }, 5000);
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  });

  await new Promise((resolve) => mockServer.listen(MOCK_PORT, resolve));

  const backend = spawn(process.execPath, ["src/index.js"], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      ML_SERVICE_URL: `http://127.0.0.1:${MOCK_PORT}`,
      ML_CLIENT_TIMEOUT: "1000",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://isc:isc_password@localhost:5433/intelligent_supply_chain",
      JWT_SECRET: process.env.JWT_SECRET || "test-secret",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let backendOutput = "";
  backend.stdout.on("data", (d) => { backendOutput += d.toString(); });
  backend.stderr.on("data", (d) => { backendOutput += d.toString(); });

  try {
    await waitFor(`http://127.0.0.1:${BACKEND_PORT}/health`);

    const loginRes = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "planner@isc.gov.in", password: "planner123" }),
    });
    const token = (await loginRes.json()).token;

    async function setScenario(name) {
      await fetch(`http://127.0.0.1:${MOCK_PORT}/__control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: name }),
      });
    }

    async function postForecast() {
      return fetch(`http://127.0.0.1:${BACKEND_PORT}/api/demand/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: "PDS-RICE", horizon: 1, persist: false }),
      });
    }

    await setScenario("500");
    let res = await postForecast();
    assert.equal(res.status, 500);
    const body500 = await res.text();
    assert(!body500.includes("boom"), "upstream detail leaked");
    assert(!body500.includes("stack"), "stack trace leaked");

    await setScenario("503");
    res = await postForecast();
    assert.equal(res.status, 503);

    await setScenario("malformed");
    res = await postForecast();
    assert.equal(res.status, 500);

    await setScenario("timeout");
    res = await postForecast();
    assert.equal(res.status, 500);

    mockServer.close();
    await new Promise((resolve) => setTimeout(resolve, 500));
    res = await postForecast();
    assert.equal(res.status, 500);
  } finally {
    backend.kill();
    mockServer.close();
  }
});

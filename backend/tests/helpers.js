import assert from "node:assert/strict";

export async function login(email, password) {
  const res = await fetch("http://127.0.0.1:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "login failed");
  return data.token;
}

export function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

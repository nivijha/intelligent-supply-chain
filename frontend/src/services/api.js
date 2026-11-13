
import axios from "axios";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error || {};
    const status = response?.status;

    if (
      status &&
      RETRYABLE_STATUSES.has(status) &&
      !config.__retryCount
    ) {
      config.__retryCount = 0;
    }

    if (
      status &&
      RETRYABLE_STATUSES.has(status) &&
      config.__retryCount < 3
    ) {
      config.__retryCount += 1;

      let backoffMs;
      const retryAfter = response?.headers?.["retry-after"];
      if (retryAfter) {
        backoffMs = Number(retryAfter) * 1000 || 0;
      }
      if (!backoffMs || backoffMs <= 0) {
        const base = Math.min(1000 * 2 ** (config.__retryCount - 1), 8000);
        backoffMs = base + Math.floor(Math.random() * base * 0.3);
      }

      await sleep(backoffMs);
      return api(config);
    }

    if (status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

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

/* ------------------------------------------------------------------ */
/* Request queue – prevents burst of concurrent requests from hitting   */
/* Render’s rate limiter. Only one request is in flight at a time,      */
/* with a small inter-request gap so bursts are spaced out.             */
/* ------------------------------------------------------------------ */
const QUEUE_INTER_REQUEST_GAP_MS = 400;
let lastRequestTime = 0;
let queuePromise = Promise.resolve();

function enqueueRequest(perform) {
  queuePromise = queuePromise
    .then(async () => {
      const now = Date.now();
      const gap = lastRequestTime > 0 ? now - lastRequestTime : 0;
      if (gap < QUEUE_INTER_REQUEST_GAP_MS) {
        await sleep(QUEUE_INTER_REQUEST_GAP_MS - gap);
      }
      lastRequestTime = Date.now();
      return perform();
    });
  return queuePromise;
}

const originalRequest = api.request.bind(api);
api.request = async (config) => {
  return enqueueRequest(() => originalRequest(config));
};

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

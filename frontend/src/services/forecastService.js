import api from "./api";

let productsCache = null;
async function products() {
  if (productsCache) return productsCache;
  const res = await api.get("/products");
  productsCache = res.data.data || [];
  return productsCache;
}

async function productIdFor(commodity) {
  const list = await products();
  const found = list.find((p) => p.product_name === commodity || p.product_id === commodity);
  return found ? found.product_id : commodity;
}

// Deduplicate in-flight requests so concurrent identical calls share one promise.
const inflight = new Map();

function requestKey(method, url, body) {
  return `${method}:${url}:${JSON.stringify(body ?? {})}`;
}

async function dedupedRequest(method, url, body) {
  const key = requestKey(method, url, body);
  if (inflight.has(key)) return inflight.get(key);
  const promise = (method === "get" ? api.get(url) : api.post(url, body)).finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

/* ------------------------------------------------------------------ */
/* Model info cache with TTL – model metrics change rarely, so cache    */
/* them for 5 minutes to avoid repeated GET /api/demand/metrics calls   */
/* on every page navigation.                                            */
/* ------------------------------------------------------------------ */
const MODEL_INFO_TTL_MS = 5 * 60 * 1000;
let modelInfoCache = { data: null, timestamp: 0 };

async function getModelInfoCached() {
  const now = Date.now();
  if (modelInfoCache.data && now - modelInfoCache.timestamp < MODEL_INFO_TTL_MS) {
    return modelInfoCache.data;
  }
  const res = await dedupedRequest("get", "/demand/metrics");
  modelInfoCache = { data: res.data, timestamp: now };
  return res.data;
}

export const forecastService = {
  async getCommodities() {
    const list = await products();
    return list.map((p) => p.product_name);
  },

  async getRegions() {
    const res = await api.get("/districts");
    return (res.data.data || []).map((d) => d.district_name);
  },

  async getWarehouses() {
    const res = await api.get("/warehouses");
    return (res.data.data || []).map((w) => w.warehouse_id);
  },

  async getHorizons() {
    return [
      { value: 1, label: "1 Month" },
      { value: 3, label: "3 Months" },
      { value: 6, label: "6 Months" },
    ];
  },

  async getHistoricalData(commodity, days = 180) {
    const productId = await productIdFor(commodity);
    const res = await dedupedRequest("get", "/demand/history", { params: { product_id: productId } });
    return (res.data.data || []).map((r) => ({
      date: r.month,
      demand: Number(r.demand_quintals),
      type: "historical",
    }));
  },

  async getForecastData(commodity, horizon = 1) {
    const productId = await productIdFor(commodity);
    const months = typeof horizon === "number" && horizon > 6 ? Math.round(horizon / 30) : horizon || 1;
    const res = await dedupedRequest("post", "/demand/forecast", {
      product_id: productId,
      horizon: Math.max(1, Math.min(12, months)),
      persist: false,
    });
    return (res.data.data || []).map((r) => ({
      date: r.forecast_month,
      demand: Number(r.predicted_demand_quintals),
      lowerBound: Number(r.predicted_demand_quintals) * 0.9,
      upperBound: Number(r.predicted_demand_quintals) * 1.1,
      type: "forecast",
    }));
  },

  async getForecastRaw(commodity, horizon = 1) {
    const productId = await productIdFor(commodity);
    const months = typeof horizon === "number" && horizon > 6 ? Math.round(horizon / 30) : horizon || 1;
    const res = await dedupedRequest("post", "/demand/forecast", {
      product_id: productId,
      horizon: Math.max(1, Math.min(12, months)),
      persist: false,
    });
    return res.data.data || [];
  },

  async getModelInfo() {
    const data = await getModelInfoCached();
    const rf = data.metrics?.random_forest || {};
    return {
      model: "Random Forest",
      baseline: "Seasonal Naive",
      version: data.model_version,
      lastTrained: "see model artifact",
      evaluation: {
        MAE: rf.mae?.toFixed ? rf.mae.toFixed(1) : rf.mae,
        RMSE: rf.rmse?.toFixed ? rf.rmse.toFixed(1) : rf.rmse,
        MAPE: rf.mape ? `${Number(rf.mape).toFixed(1)}%` : "n/a",
      },
      features: ["lag_1", "lag_3", "lag_12", "rolling_mean_3", "month_sin", "month_cos"],
    };
  },

  async getShapFeatures(commodity, region) {
    try {
      if (!commodity) return [];
      const productId = await productIdFor(commodity);
      if (!productId) return [];

      const params = { product_id: productId };
      if (region) {
        const districtsRes = await api.get("/districts");
        const district = (districtsRes.data.data || []).find((item) => item.district_name === region);
        if (district) params.district_id = district.district_id;
      }

      const histRes = await dedupedRequest("get", "/demand/history", { params });
      const records = (histRes.data.data || [])
        .slice()
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .slice(-13);
      if (records.length < 13) return [];

      const res = await dedupedRequest("post", "/demand/explain", { records, top_n: 10 });
      const first = (res.data.data || [])[0];
      return (first?.contributions || []).map((c) => ({
        feature: c.feature,
        contribution: Math.abs(c.contribution),
        direction: c.direction === "increases" ? "positive" : "negative",
      }));
    } catch (err) {
      return [];
    }
  },

  async getForecastSummary(commodity) {
    const productId = await productIdFor(commodity);
    const forecastRes = await dedupedRequest("post", "/demand/forecast", {
      product_id: productId,
      horizon: 3,
      persist: false,
    });
    const forecasts = forecastRes.data.data || [];
    const total = forecasts.reduce((sum, r) => sum + Number(r.predicted_demand_quintals), 0);
    return {
      forecastedDemand: Math.round(total),
      currentInventory: 0,
      expectedShortfall: 0,
      safetyStock: 0,
      horizon: forecasts.length ? forecasts.length : 3,
    };
  },
};

export default forecastService;

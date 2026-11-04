import api from "./api";

const typeMap = {
  REPLENISHMENT: "Replenishment",
};

export const recommendationService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    const res = await api.get("/recommendations", { params });
    const data = (res.data.data || []).map((r) => ({
      id: r.id,
      commodity: r.product_id,
      warehouse: r.warehouse_id,
      type: typeMap[r.recommendation_type] || r.recommendation_type,
      priority: "Medium",
      status: r.status === "APPROVED" ? "Approved" : r.status === "REJECTED" ? "Rejected" : r.status === "EXECUTED" ? "Executed" : "Pending",
      description: r.justification,
      createdDate: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
    }));
    let filtered = data;
    if (filters.priority) filtered = filtered.filter((r) => r.priority === filters.priority);
    return { data: filtered, total: filtered.length };
  },

  async getById(id) {
    const res = await api.get(`/recommendations/${id}`);
    const r = res.data;
    return {
      id: r.id,
      commodity: r.product_id,
      warehouse: r.warehouse_id,
      type: typeMap[r.recommendation_type] || r.recommendation_type,
      priority: "Medium",
      status: r.status,
      description: r.justification,
      createdDate: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
    };
  },

  async updateStatus(id, status) {
    const apiStatus = status.toUpperCase();
    const res = await api.patch(`/recommendations/${id}/status`, { status: apiStatus });
    return res.data;
  },

  async getStats() {
    const { data } = await this.getAll();
    return {
      total: data.length,
      pending: data.filter((r) => r.status === "Pending").length,
      approved: data.filter((r) => r.status === "Approved").length,
      rejected: data.filter((r) => r.status === "Rejected").length,
    };
  },

  async generate({ districtId, productId, horizon = 1 } = {}) {
    const res = await api.post("/recommendations/generate", {
      district_id: districtId,
      product_id: productId,
      horizon,
    });
    return res.data;
  },

  async getTypes() {
    return ["Replenishment"];
  },

  async getPriorities() {
    return ["High", "Medium", "Low"];
  },

  async getStatuses() {
    return ["Pending", "Approved", "Rejected", "Executed"];
  },
};

export default recommendationService;

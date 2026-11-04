import api from "./api";

export const warehouseService = {
  async getAll() {
    const res = await api.get("/warehouses");
    return (res.data.data || []).map((w) => ({
      id: w.warehouse_id,
      name: w.warehouse_name,
      location: w.location_district_id,
      state: w.state,
      capacity: Number(w.capacity_quintals),
      utilization: 0,
      utilizationPercentage: 0,
      utilizationStatus: "Normal",
    }));
  },

  async getById(id) {
    const res = await api.get(`/warehouses/${id}`);
    const w = res.data;
    return {
      id: w.warehouse_id,
      name: w.warehouse_name,
      location: w.location_district_id,
      state: w.state,
      capacity: Number(w.capacity_quintals),
      utilizationPercentage: 0,
      utilizationStatus: "Normal",
    };
  },

  async getStats() {
    const all = await this.getAll();
    return { totalWarehouses: all.length };
  },
};

export default warehouseService;

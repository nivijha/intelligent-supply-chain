import api from "./api";

let productMapCache = null;
async function productMap() {
  if (productMapCache) return productMapCache;
  const res = await api.get("/products");
  productMapCache = {};
  for (const p of res.data.data || []) productMapCache[p.product_id] = p;
  return productMapCache;
}

const statusMap = {
  REORDER: "Low Stock",
  SUFFICIENT: "Normal",
};

export const inventoryService = {
  async getAll(filters = {}) {
    const params = {};
    if (filters.warehouse) params.warehouse_id = filters.warehouse;
    if (filters.commodity) params.product_id = filters.commodity;
    const res = await api.get("/inventory", { params });
    const pm = await productMap();
    const data = (res.data.data || []).map((item) => ({
      id: `${item.warehouse_id}-${item.product_id}`,
      commodity: pm[item.product_id]?.product_name || item.product_id,
      category: pm[item.product_id]?.storage_type || "General",
      warehouse: item.warehouse_id,
      warehouseName: item.warehouse_name || item.warehouse_id,
      currentStock: Number(item.on_hand_quintals || 0),
      safetyStock: Number(item.safety_stock_quintals || 0),
      forecastDemand: Number(item.reorder_point_quintals || 0),
      status: item.risk_level === "CRITICAL" ? "Critical" : item.risk_level === "OVERSTOCK" ? "Excess" : statusMap[item.stock_status] || "Normal",
      lastUpdated: item.snapshot_date,
      unit: "quintals",
    }));
    return { data, total: data.length };
  },

  async getById(id) {
    const { data: all } = await this.getAll();
    const item = all.find((i) => i.id === id);
    if (!item) throw new Error("Inventory item not found");
    return item;
  },

  async getStats() {
    const { data } = await this.getAll();
    return {
      totalItems: data.length,
      lowStock: data.filter((i) => i.status === "Low Stock").length,
      critical: data.filter((i) => i.status === "Critical").length,
      normal: data.filter((i) => i.status === "Normal").length,
    };
  },
};

export default inventoryService;

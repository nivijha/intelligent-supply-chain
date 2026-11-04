import { useState, useMemo, useEffect } from "react";
import { inventoryService } from "../services/inventoryService";
import { InventoryFilters, InventoryTable, InventoryDetailModal } from "../components/inventory";
import { Package, Filter, Download, Loader2, AlertCircle } from "lucide-react";
import { EmptyInventoryState } from "../components/common/EmptyState";

export function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [commodity, setCommodity] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [status, setStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    inventoryService
      .getAll()
      .then((res) => {
        if (active) setData(res.data || []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error || err.message || "Failed to load inventory");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        !search ||
        item.commodity.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCommodity = !commodity || item.commodity === commodity;
      const matchesWarehouse = !warehouse || item.warehouse === warehouse;
      const matchesStatus = !status || item.status === status;

      return matchesSearch && matchesCommodity && matchesWarehouse && matchesStatus;
    });
  }, [data, search, commodity, warehouse, status]);

  const stats = {
    totalItems: data.length,
    lowStock: data.filter((i) => i.status === "Low Stock").length,
    critical: data.filter((i) => i.status === "Critical").length,
    normal: data.filter((i) => i.status === "Normal").length,
  };

  const hasActiveFilters = search || commodity || warehouse || status;

  const handleClearFilters = () => {
    setSearch("");
    setCommodity("");
    setWarehouse("");
    setStatus("");
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage stock levels across all warehouses and commodities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Critical</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Normal</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.normal}</p>
        </div>
      </div>

      <InventoryFilters
        commodities={[...new Set(data.map((i) => i.commodity))]}
        warehouses={[...new Set(data.map((i) => i.warehouse))]}
        search={search}
        onSearchChange={setSearch}
        commodity={commodity}
        onCommodityChange={setCommodity}
        warehouse={warehouse}
        onWarehouseChange={setWarehouse}
        status={status}
        onStatusChange={setStatus}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {filteredData.length === 0 ? (
        <EmptyInventoryState />
      ) : (
        <InventoryTable
          data={filteredData}
          onRowClick={handleRowClick}
        />
      )}

      <InventoryDetailModal
        item={selectedItem}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}

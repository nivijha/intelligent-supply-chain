import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { inventoryService } from "../services/inventoryService";
import { Loader2, AlertCircle } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";

export function Analytics() {
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, inv] = await Promise.all([dashboardService.getSummary(), inventoryService.getAll()]);
        if (active) {
          setSummary(s);
          setInventory(inv.data || []);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message || "Failed to load analytics");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Operational summary and inventory distribution.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inventory Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.inventory_items ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Warehouses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.warehouses ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending Recommendations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.pending_recommendations ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Shipments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.shipments ?? 0}</p>
        </div>
      </div>
      {inventory.length === 0 ? (
        <EmptyState title="No inventory data" description="No inventory records available for analytics." />
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Status</h2>
        <div className="space-y-2">
          {["Normal", "Low Stock", "Critical", "Excess"].map((status) => (
            <div key={status} className="flex items-center justify-between">
              <span className="text-gray-700">{status}</span>
              <span className="font-medium">{inventory.filter((i) => i.status === status).length}</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

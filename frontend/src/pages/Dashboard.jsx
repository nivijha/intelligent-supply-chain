import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { recommendationService } from "../services/recommendationService";
import { Loader2, AlertCircle, Package, Warehouse, ListChecks } from "lucide-react";
import { EmptyRecommendationState } from "../components/common/EmptyState";

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, r] = await Promise.all([
          dashboardService.getSummary(),
          recommendationService.getAll(),
        ]);
        if (active) {
          setSummary(s);
          setRecommendations((r.data || []).slice(0, 5));
        }
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message || "Failed to load dashboard");
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
        <h1 className="text-2xl font-bold text-gray-900">Supply Chain Overview</h1>
        <p className="text-gray-500 mt-1">
          Monitor inventory, warehouses and operational recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inventory Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.inventory_items ?? 0}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Warehouses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.warehouses ?? 0}</p>
            </div>
            <Warehouse className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Recommendations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.pending_recommendations ?? 0}</p>
            </div>
            <ListChecks className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.shipments ?? 0}</p>
            </div>
            <ListChecks className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Recommendations</h2>
        {recommendations.length === 0 ? (
          <EmptyRecommendationState />
        ) : (
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-900">{r.commodity} - {r.warehouse}</p>
                  <p className="text-sm text-gray-500">{r.description}</p>
                </div>
                <span className="text-sm text-gray-600">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

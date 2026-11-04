import { useState, useEffect } from "react";
import { warehouseService } from "../services/warehouseService";
import { Loader2, AlertCircle } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";

export function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    warehouseService
      .getAll()
      .then((data) => {
        if (active) setWarehouses(data || []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error || err.message || "Failed to load warehouses");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
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
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
        <p className="text-gray-500 mt-1">View warehouse capacity and locations.</p>
      </div>
      {warehouses.length === 0 ? (
        <EmptyState title="No warehouses" description="No warehouses available." />
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Warehouse</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">State</th>
              <th className="text-right p-3">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id} className="border-t border-gray-100">
                <td className="p-3 font-medium">{w.id} - {w.name}</td>
                <td className="p-3">{w.location}</td>
                <td className="p-3">{w.state}</td>
                <td className="p-3 text-right">{Number(w.capacity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

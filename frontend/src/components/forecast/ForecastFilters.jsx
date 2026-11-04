import { useEffect, useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { forecastService } from "../../services/forecastService";

export function ForecastFilters({
  commodity,
  onCommodityChange,
  region,
  onRegionChange,
  warehouse,
  onWarehouseChange,
  horizon,
  onHorizonChange,
  onClearFilters,
  hasActiveFilters,
}) {
  const [commodities, setCommodities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [horizons, setHorizons] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [c, r, w, h] = await Promise.all([
          forecastService.getCommodities(),
          forecastService.getRegions(),
          forecastService.getWarehouses(),
          forecastService.getHorizons(),
        ]);
        if (active) {
          setCommodities(c || []);
          setRegions(r || []);
          setWarehouses(w || []);
          setHorizons(h || []);
        }
      } catch (err) {
        // keep empty on failure
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
          <select
            value={commodity}
            onChange={(e) => onCommodityChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {commodities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
          <select
            value={warehouse}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Horizon</label>
          <select
            value={horizon}
            onChange={(e) => onHorizonChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {horizons.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

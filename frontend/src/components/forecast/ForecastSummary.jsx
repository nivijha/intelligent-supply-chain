import { Package, Warehouse, TrendingUp, AlertTriangle, Calendar, ArrowDownRight } from "lucide-react";
import { forecastService } from "../../services/forecastService";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/common";

export function ForecastSummary({ commodity }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const data = await forecastService.getForecastSummary(commodity);
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (commodity) {
      loadSummary();
    }
  }, [commodity]);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const shortfall = summary.expectedShortfall > 0;
  const shortfallPercent = summary.currentInventory > 0
    ? ((summary.expectedShortfall / summary.currentInventory) * 100).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Forecasted Demand</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.forecastedDemand.toLocaleString()} units</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Over {summary.horizon} days</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Inventory</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.currentInventory.toLocaleString()} units</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Available stock</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Expected Shortfall</p>
            <p className={`text-2xl font-bold mt-1 ${shortfall ? "text-red-600" : "text-green-600"}`}>
              {shortfall ? summary.expectedShortfall.toLocaleString() : 0} units
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${shortfall ? "bg-red-50" : "bg-green-50"}`}>
            {shortfall ? (
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            ) : (
              <span className="text-green-600 text-xl">✓</span>
            )}
          </div>
        </div>
        <p className={`text-xs mt-2 ${shortfall ? "text-red-600" : "text-green-600"}`}>
          {shortfall ? `${shortfallPercent}% deficit projected` : "Sufficient stock"}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Safety Stock</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.safetyStock.toLocaleString()} units</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Minimum buffer level</p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { ForecastFilters, ForecastChart, ForecastSummary, ExplanationChart } from "../components/forecast";
import { TrendingUp, Download, Filter } from "lucide-react";

export function Forecast() {
  const [commodity, setCommodity] = useState("Wheat");
  const [region, setRegion] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [horizon, setHorizon] = useState(30);

  const hasActiveFilters = region || warehouse || horizon !== 30;

  const handleClearFilters = () => {
    setRegion("");
    setWarehouse("");
    setHorizon(30);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demand Forecast</h1>
          <p className="text-gray-500 mt-1">
            ML-powered demand forecasting with explainable AI for supply chain planning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Forecast
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      <ForecastFilters
        commodity={commodity}
        onCommodityChange={setCommodity}
        region={region}
        onRegionChange={setRegion}
        warehouse={warehouse}
        onWarehouseChange={setWarehouse}
        horizon={horizon}
        onHorizonChange={setHorizon}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <ForecastSummary commodity={commodity} />

      <ForecastChart commodity={commodity} horizon={horizon} />

      <ExplanationChart commodity={commodity} />
    </div>
  );
}
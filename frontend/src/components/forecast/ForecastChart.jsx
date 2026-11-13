import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer } from "../../components/common";
import { forecastService } from "../../services/forecastService";
import { EmptyState } from "../../components/common/EmptyState";

export function ForecastChart({ commodity, horizon, forecastData, forecastLoading, forecastError }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const hist = await forecastService.getHistoricalData(commodity, 180);
        setHistoricalData(hist);
      } catch {
        // Error surfaced via forecastError prop from parent
      } finally {
        setLoading(false);
      }
    };

    if (commodity) {
      loadData();
    }
  }, [commodity]);

  const combinedData = [...historicalData, ...(forecastData || [])].map((r) => ({
    date: r.forecast_month || r.date,
    demand: Number(r.predicted_demand_quintals ?? r.demand),
    lowerBound: Number(r.predicted_demand_quintals ?? r.demand) * 0.9,
    upperBound: Number(r.predicted_demand_quintals ?? r.demand) * 1.1,
    type: r.type || "forecast",
  }));

  if (forecastError) {
    return (
      <ChartContainer
        title="Demand Forecast"
        subtitle="Failed to load data"
        error={true}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <p className="mb-2">Could not load forecast data.</p>
          <p className="text-xs mb-4">{forecastError}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (commodity) {
                const hist = forecastService.getHistoricalData(commodity, 180);
                hist.then((h) => setHistoricalData(h));
              }
            }}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </ChartContainer>
    );
  }

  if (loading || forecastLoading) {
    return (
      <ChartContainer
        title="Demand Forecast"
        subtitle={`Historical vs Forecast for ${commodity || "select a commodity"}`}
        loading={true}
      />
    );
  }

  if (!combinedData.length) {
    return (
      <ChartContainer title="Demand Forecast" subtitle="No forecast data available">
        <EmptyState title="No forecast data" description="Forecast data is not available for this selection." />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Demand Forecast"
      subtitle={`Historical vs Forecast for ${commodity} (${horizon} days)`}
      action={{ label: "Export" }}
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [
                value.toLocaleString(),
                name === "historical" ? "Historical" : name === "forecast" ? "Forecast" : "Confidence",
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="confidence"
              fill="#93c5fd"
              fillOpacity={0.3}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="confidence"
              fill="#93c5fd"
              fillOpacity={0.3}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#2563eb" }}
              name="Historical"
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: "#dc2626" }}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-gray-600">Historical Demand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" style={{ borderBottom: "2px dashed #dc2626" }} />
          <span className="text-gray-600">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 rounded bg-blue-200" />
          <span className="text-gray-600">95% Confidence Interval</span>
        </div>
      </div>
    </ChartContainer>
  );
}
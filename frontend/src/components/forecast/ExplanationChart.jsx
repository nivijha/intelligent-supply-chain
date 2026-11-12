import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { forecastService } from "../../services/forecastService";
import { ChartContainer } from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";

export function ExplanationChart({ commodity, region }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    const loadExplanation = async () => {
      setLoading(true);
      try {
        const [shapData, model] = await Promise.all([
          forecastService.getShapFeatures(commodity, region),
          forecastService.getModelInfo(),
        ]);
        setFeatures(shapData);
        setModelInfo(model);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (commodity) {
      loadExplanation();
    } else {
      setLoading(false);
    }
  }, [commodity, region]);

  if (!commodity) {
    return (
      <ChartContainer title="Prediction Explanation" subtitle="Factors influencing the forecast (SHAP values)">
        <EmptyState title="No explanation available" description="Select a commodity to view SHAP feature contributions." />
      </ChartContainer>
    );
  }

  if (loading) {
    return (
      <ChartContainer
        title="Prediction Explanation"
        subtitle="Factors influencing the forecast (SHAP values)"
        loading={true}
      />
    );
  }

  const sortedFeatures = [...features].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const maxContribution = sortedFeatures.length ? Math.max(...sortedFeatures.map((f) => Math.abs(f.contribution))) : 0;

  if (!sortedFeatures.length) {
    return (
      <ChartContainer title="Prediction Explanation" subtitle="Factors influencing the forecast (SHAP values)">
        <EmptyState
          title="No explanation available"
          description={region
            ? "SHAP contributions are not available for this selection."
            : "Select a region to view district-level SHAP feature contributions."}
        />
      </ChartContainer>
    );
  }

  return (
    <>
      <ChartContainer
        title="Prediction Explanation"
        subtitle="Factors influencing the forecast (SHAP values)"
        action={{ label: "Model Details" }}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedFeatures} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, maxContribution * 1.2]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="feature"
                type="category"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value}%`, "Contribution"]}
              />
              <Bar
                dataKey="contribution"
                radius={[0, 4, 4, 0]}
              >
                {sortedFeatures.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.direction === "positive" ? "#dc2626" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-900">Interpretation:</strong>{" "}
            The model predicts {"increased" /* commodity-specific logic could go here */} demand primarily due to{" "}
            <strong>{sortedFeatures[0]?.feature}</strong> ({sortedFeatures[0]?.contribution}% contribution) and{" "}
            <strong>{sortedFeatures[1]?.feature}</strong> ({sortedFeatures[1]?.contribution}% contribution).
          </p>
        </div>
      </ChartContainer>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Model</p>
            <p className="font-medium text-gray-900">{modelInfo?.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Baseline</p>
            <p className="font-medium text-gray-900">{modelInfo?.baseline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Version</p>
            <p className="font-medium text-gray-900">{modelInfo?.version}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Trained</p>
            <p className="font-medium text-gray-900">{modelInfo?.lastTrained}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Evaluation Metrics</p>
            <div className="flex flex-wrap gap-4 mt-1 text-sm">
              <span className="font-medium text-gray-900">MAE: {modelInfo?.evaluation?.MAE}</span>
              <span className="font-medium text-gray-900">RMSE: {modelInfo?.evaluation?.RMSE}</span>
              <span className="font-medium text-gray-900">MAPE: {modelInfo?.evaluation?.MAPE}</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-gray-500">Features Used</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {modelInfo?.features?.map((f, i) => (
                <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>


      </div>
    </>
  );
}
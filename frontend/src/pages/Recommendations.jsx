import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { recommendationService } from "../services/recommendationService";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { EmptyRecommendationState } from "../components/common/EmptyState";

export function Recommendations() {
  const { user } = useAuth();
  const canGenerate = ["ADMIN", "PLANNER"].includes(user?.role);
  const canApprove = ["ADMIN", "PLANNER", "WAREHOUSE_MANAGER"].includes(user?.role);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    recommendationService
      .getAll()
      .then((res) => setRecommendations(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message || "Failed to load recommendations"))
      .finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      await recommendationService.generate({ districtId: "D001", productId: "PDS-RICE", horizon: 1 });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    setActionId(id);
    try {
      await recommendationService.updateStatus(id, status);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Action failed");
    } finally {
      setActionId(null);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-500 mt-1">Review and approve replenishment recommendations.</p>
        </div>
        {canGenerate && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        )}
      </div>
      {recommendations.length === 0 ? (
        <div className="space-y-4">
          <EmptyRecommendationState />
          {canGenerate && (
            <p className="text-sm text-gray-500 text-center">
              Generate a recommendation to get started.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{r.commodity} - {r.warehouse}</p>
                  <p className="text-sm text-gray-500">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Status: {r.status}</p>
                </div>
                {r.status === "Pending" && canApprove && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(r.id, "Approved")}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleStatus(r.id, "Rejected")}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

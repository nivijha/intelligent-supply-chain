import { useState, useEffect } from "react";
import { recommendationService } from "../services/recommendationService";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function Approvals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canGenerate = ["ADMIN", "PLANNER"].includes(user?.role);
  const canApprove = ["ADMIN", "PLANNER", "WAREHOUSE_MANAGER"].includes(user?.role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    recommendationService
      .getAll({ status: "Pending" })
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.response?.data?.error || err.message || "Failed to load approvals"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handle = async (id, status) => {
    setActionId(id);
    try {
      await recommendationService.updateStatus(id, status, reason);
      setReason("");
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Management</h1>
        <p className="text-gray-500 mt-1">Pending recommendations requiring human validation.</p>
      </div>
      {items.length === 0 ? (
        <div className="space-y-4">
          <p className="text-gray-500 text-center">No pending approvals.</p>
          {canGenerate && (
            <button
              onClick={() => navigate("/recommendations")}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Generate recommendations
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="font-medium text-gray-900">{r.commodity} - {r.warehouse}</p>
              <p className="text-sm text-gray-500">{r.description}</p>
              {canApprove && (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional for approve, required for reject)"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handle(r.id, "Approved")}
                    disabled={actionId === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handle(r.id, "Rejected")}
                    disabled={actionId === r.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

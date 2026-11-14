import { Modal } from "../../components/common";
import { Package, Warehouse, TrendingUp, AlertTriangle, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatusBadge, PriorityBadge } from "../../components/common";

export function InventoryDetailModal({ item, isOpen, onClose }) {
  if (!item) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Normal": return "text-green-600 bg-green-50";
      case "Low Stock": return "text-yellow-600 bg-yellow-50";
      case "Critical": return "text-red-600 bg-red-50";
      case "Excess": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const forecastDemand = Number(item.forecastDemand || 0);
  const currentStock = Number(item.currentStock || 0);
  const deficit = forecastDemand - currentStock;
  const deficitPercent = currentStock > 0 ? ((deficit / currentStock) * 100).toFixed(1) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${item.commodity} — ${item.warehouse}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Package className="w-4 h-4" />
              <span>Commodity</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{item.commodity}</p>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Warehouse className="w-4 h-4" />
              <span>Warehouse</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{item.warehouse}</p>
            <p className="text-sm text-gray-500">{item.warehouseName}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Last Updated</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{item.lastUpdated}</p>
            <p className="text-sm text-gray-500">Inventory snapshot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Inventory</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {item.currentStock.toLocaleString()} {item.unit}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-gray-50">
            <span className="text-sm font-medium text-gray-500">Safety Stock</span>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {item.safetyStock.toLocaleString()} {item.unit}
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-gray-50">
            <span className="text-sm font-medium text-gray-500">Forecast Demand</span>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {item.forecastDemand.toLocaleString()} {item.unit}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Stock Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                <ArrowDownRight className="w-4 h-4" />
                <span className="font-medium">Deficit</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{deficit > 0 ? deficit.toLocaleString() : 0} {item.unit}</p>
              <p className="text-sm text-gray-500">{deficit > 0 ? `${deficitPercent}% below forecast` : "Sufficient"}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Safety Buffer</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {item.currentStock - item.safetyStock > 0
                  ? `+${(item.currentStock - item.safetyStock).toLocaleString()}`
                  : (item.currentStock - item.safetyStock).toLocaleString()}
                {item.unit}
              </p>
              <p className="text-sm text-gray-500">
                {item.currentStock >= item.safetyStock ? "Above safety level" : "Below safety level"}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Coverage</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {forecastDemand > 0 ? Math.max(0, Math.round((currentStock / forecastDemand) * 100)) : 0}%
              </p>
              <p className="text-sm text-gray-500">Days of supply at forecast rate</p>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
          <h3 className="font-medium text-primary-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommended Action
          </h3>
          <p className="text-primary-800">
            {item.status === "Critical"
              ? "URGENT: Immediate replenishment required. Stock will deplete within days."
              : item.status === "Low Stock"
              ? "Schedule replenishment within 7 days. Coordinate with procurement for priority supply."
              : item.status === "Excess"
              ? "Consider redistribution to deficit warehouses or promotional release to prevent quality degradation."
              : "Maintain current procurement schedule. Monitor for demand changes."}
          </p>
        </div>
      </div>
    </Modal>
  );
}
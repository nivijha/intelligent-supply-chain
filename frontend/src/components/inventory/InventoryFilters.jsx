import { Search, Filter, X } from "lucide-react";

const statuses = ["Normal", "Low Stock", "Critical", "Excess"];

export function InventoryFilters({
  commodities = [],
  warehouses = [],
  search,
  onSearchChange,
  commodity,
  onCommodityChange,
  warehouse,
  onWarehouseChange,
  status,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search commodity, warehouse, ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={commodity}
            onChange={(e) => onCommodityChange(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px]"
          >
            <option value="">All Commodities</option>
            {commodities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={warehouse}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px]"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
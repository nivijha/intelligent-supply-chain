import { StatusBadge } from "../../components/common";

const statusColors = {
  Normal: "bg-green-100 text-green-800",
  "Low Stock": "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-800",
  Excess: "bg-blue-100 text-blue-800",
};

export function InventoryTable({ data, onRowClick, loading = false }) {
  const columns = [
    { key: "commodity", header: "Commodity" },
    { key: "category", header: "Category" },
    { key: "warehouse", header: "Warehouse", label: "Warehouse" },
    { key: "currentStock", header: "Current Stock", align: "right" },
    { key: "safetyStock", header: "Safety Stock", align: "right" },
    { key: "forecastDemand", header: "Forecast Demand", align: "right" },
    { key: "status", header: "Status" },
    { key: "lastUpdated", header: "Last Updated" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === "right" ? "text-right" : ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No inventory items found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === "right" ? "text-right" : ""}`}
                >
                  {col.header}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-4 font-medium text-gray-900">{item.commodity}</td>
                <td className="px-4 py-4 text-gray-600">{item.category}</td>
                <td className="px-4 py-4 text-gray-600">
                  <span className="font-mono text-sm">{item.warehouse}</span>
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-900">
                  {item.currentStock.toLocaleString()} {item.unit}
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-500">
                  {item.safetyStock.toLocaleString()} {item.unit}
                </td>
                <td className="px-4 py-4 text-right font-mono text-gray-500">
                  {item.forecastDemand.toLocaleString()} {item.unit}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-4 text-gray-500 text-sm">{item.lastUpdated}</td>
                <td className="px-4 py-4">
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {data.length} items
        </p>
      </div>
    </div>
  );
}
import { LoadingState } from "./LoadingState";

export function ChartContainer({ title, subtitle, children, className = "", action, loading = false, error = null }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            {action.label}
          </button>
        )}
      </div>
      <div className="p-6">
        {loading && <LoadingState className="h-64" size="lg" />}
        {error && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Failed to load chart</p>
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  );
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, trendLabel, className = "", loading = false }) {
  const trendColor = trend?.startsWith("+") ? "text-green-600" : trend?.startsWith("-") ? "text-red-600" : "text-gray-500";

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <LoadingState variant="title" className="w-24" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
            {trend && (
              <span className={`text-sm font-medium ${trendColor} flex items-center gap-1`}>
                {trend.startsWith("+") ? "↑" : trend.startsWith("-") ? "↓" : "→"}
                <span>{trend}</span>
              </span>
            )}
          </div>
          {subtitle && !loading && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
          {trendLabel && !loading && (
            <p className="mt-1 text-xs text-gray-400">{trendLabel}</p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
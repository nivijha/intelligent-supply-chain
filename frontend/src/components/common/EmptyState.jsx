import { Search, Package, AlertTriangle, Filter } from "lucide-react";

export function EmptyState({
  icon: Icon = Package,
  title = "No data available",
  description = "There are no items to display.",
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-sm">{description}</p>
      {action && (
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          onClick={action.onClick}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

export function EmptySearchState({ onClearFilters, className = "" }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
      action={{
        label: "Clear filters",
        icon: Filter,
        onClick: onClearFilters,
      }}
      className={className}
    />
  );
}

export function EmptyInventoryState({ className = "" }) {
  return (
    <EmptyState
      icon={Package}
      title="No inventory items"
      description="No inventory items match your current filters. Try adjusting your search criteria."
      className={className}
    />
  );
}

export function EmptyRecommendationState({ className = "" }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No recommendations"
      description="There are no recommendations matching your current filters."
      className={className}
    />
  );
}
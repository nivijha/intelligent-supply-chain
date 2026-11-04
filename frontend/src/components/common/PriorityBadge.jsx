const priorityStyles = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-blue-100 text-blue-800",
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export function PriorityBadge({ priority, className = "", showIcon = true }) {
  const style = priorityStyles[priority] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}>
      {showIcon && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {priority}
    </span>
  );
}
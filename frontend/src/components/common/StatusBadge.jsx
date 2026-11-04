const statusStyles = {
  Normal: "bg-green-100 text-green-800",
  "Low Stock": "bg-yellow-100 text-yellow-800",
  Critical: "bg-red-100 text-red-800",
  Excess: "bg-blue-100 text-blue-800",
  High: "bg-yellow-100 text-yellow-800",
  "Pending Review": "bg-yellow-100 text-yellow-800",
  Reviewed: "bg-blue-100 text-blue-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Implemented: "bg-primary-100 text-primary-800",
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  implemented: "bg-primary-100 text-primary-800",
};

export function StatusBadge({ status, className = "" }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {status}
    </span>
  );
}
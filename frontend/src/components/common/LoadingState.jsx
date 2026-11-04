export function LoadingState({ className = "", size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-primary-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function LoadingSkeleton({ className = "", variant = "text" }) {
  const baseClass = "animate-pulse bg-gray-200 rounded";
  const variants = {
    text: "h-4 w-full",
    title: "h-6 w-3/4",
    card: "h-32 w-full",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-lg",
    tableRow: "h-12 w-full",
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
}

export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="space-y-2">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} variant="text" className="h-5" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, col) => (
            <LoadingSkeleton key={col} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">403 - Forbidden</h1>
        <p className="text-gray-500 mb-6">You do not have permission to access this page.</p>
        <Link to="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

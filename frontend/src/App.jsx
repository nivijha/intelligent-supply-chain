import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Forecast } from "./pages/Forecast";
import { Warehouses } from "./pages/Warehouses";
import { Recommendations } from "./pages/Recommendations";
import { Analytics } from "./pages/Analytics";
import { Forbidden } from "./pages/Forbidden";
import { Approvals } from "./pages/Approvals";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/forecast" element={<RoleRoute roles={["ADMIN","PLANNER","ANALYST"]}><Forecast /></RoleRoute>} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/recommendations" element={<RoleRoute roles={["ADMIN","PLANNER","WAREHOUSE_MANAGER","ANALYST"]}><Recommendations /></RoleRoute>} />
        <Route path="/analytics" element={<RoleRoute roles={["ADMIN","ANALYST"]}><Analytics /></RoleRoute>} />
        <Route path="/approvals" element={<RoleRoute roles={["ADMIN","PLANNER","WAREHOUSE_MANAGER"]}><Approvals /></RoleRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
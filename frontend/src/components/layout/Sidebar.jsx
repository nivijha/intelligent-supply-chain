import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  ListChecks,
  BarChart3,
  CheckCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Warehouses", href: "/warehouses", icon: Warehouse },
  { name: "Demand Forecast", href: "/forecast", icon: TrendingUp },
  { name: "Recommendations", href: "/recommendations", icon: ListChecks },
  { name: "Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];



const roleAccess = {
  "/dashboard": ["ADMIN","PLANNER","WAREHOUSE_MANAGER","ANALYST"],
  "/inventory": ["ADMIN","PLANNER","WAREHOUSE_MANAGER","ANALYST"],
  "/warehouses": ["ADMIN","PLANNER","WAREHOUSE_MANAGER","ANALYST"],
  "/forecast": ["ADMIN","PLANNER","ANALYST"],
  "/recommendations": ["ADMIN","PLANNER","WAREHOUSE_MANAGER","ANALYST"],
  "/analytics": ["ADMIN","ANALYST"],
  "/approvals": ["ADMIN","PLANNER","WAREHOUSE_MANAGER"],
};

export function Sidebar({ collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  if (collapsed) {
    return (
      <aside className="fixed left-0 top-0 z-40 w-16 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">ISC</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Main navigation">
          {navigation.filter((item) => (roleAccess[item.href] || []).includes(user?.role)).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                aria-current={isActive ? "page" : undefined}
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-full h-10 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-md"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div
        className={`fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 w-64 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-600">ISC Platform</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {navigation.filter((item) => (roleAccess[item.href] || []).includes(user?.role)).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || "Analyst"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
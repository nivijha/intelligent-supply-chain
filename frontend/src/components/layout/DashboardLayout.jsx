import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`lg:pl-64 transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? "lg:pl-16" : ""
        }`}
      >
        <Topbar
          title=""
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 lg:p-6 pt-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
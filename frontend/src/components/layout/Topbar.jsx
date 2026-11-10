import { Search, Bell, Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ProfilePopup } from "./ProfilePopup";

export function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex-1 max-w-md lg:max-w-lg hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commodities, warehouses..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative sm:flex items-center gap-3 pl-3 border-l border-gray-200">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Open user profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary-600">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.role || "Analyst"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <ProfilePopup
              user={user}
              isOpen={profileOpen}
              onClose={() => setProfileOpen(false)}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
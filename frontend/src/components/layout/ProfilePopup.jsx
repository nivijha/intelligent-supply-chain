import { User, Mail, ShieldCheck, LogOut } from "lucide-react";
import { Modal } from "../../components/common";

export function ProfilePopup({ user, isOpen, onClose, onSignOut }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="sm">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-900">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email || ""}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
              <p className="text-sm text-gray-900">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
              <p className="text-sm text-gray-900">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
              <p className="text-sm text-gray-900 capitalize">{user?.role || "—"}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => { onClose(); if (onSignOut) onSignOut(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </Modal>
  );
}

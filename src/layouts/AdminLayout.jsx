import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zlit-bg lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />

          <div className="absolute inset-y-0 left-0 w-[270px]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-zlit-surface p-2"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>

            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Star,
  Ticket,
  MessageSquare,
  Mail,
  BookImage,
  Activity,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";

const sections = [
  {
    title: "OVERVIEW",
    links: [
      { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "STORE",
    links: [
      { label: "Products", path: "/admin/products", icon: Package },
      { label: "Categories", path: "/admin/categories", icon: Tags },
      { label: "Collections", path: "/admin/collections", icon: Layers },
      { label: "Orders", path: "/admin/orders", icon: ShoppingBag, badge: true },
      { label: "Inventory", path: "/admin/inventory", icon: Warehouse },
    ],
  },
  {
    title: "CUSTOMERS",
    links: [
      { label: "Customers", path: "/admin/customers", icon: Users },
      { label: "Reviews", path: "/admin/reviews", icon: Star },
      { label: "Coupons", path: "/admin/coupons", icon: Ticket },
      { label: "Messages", path: "/admin/messages", icon: MessageSquare },
      { label: "Newsletter", path: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    title: "CONTENT",
    links: [
      { label: "Lookbook", path: "/admin/lookbook", icon: BookImage },
    ],
  },
  {
    title: "SYSTEM",
    links: [
      { label: "Activity Logs", path: "/admin/activity-logs", icon: Activity },
      { label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({
  open = false,
  onClose = () => {},
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [pendingOrders, setPendingOrders] = useState(0);

  const fetchPendingOrders = useCallback(async () => {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) {
      console.error("Pending orders fetch failed:", error.message);
      return;
    }

    setPendingOrders(count || 0);
  }, []);

  useEffect(() => {
  fetchPendingOrders();

  const channel = supabase
    .channel("admin-pending-orders")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        fetchPendingOrders();
      }
    );

  // Subscribe only after registering the listener.

  const interval = setInterval(fetchPendingOrders, 30000);

  return () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}, [fetchPendingOrders]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#1D1D20] transition-transform duration-300 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.06] px-6">
          <NavLink
            to="/admin"
            className="font-display text-2xl font-bold tracking-tight"
          >
            ZL<span className="text-zlit-red">IT</span>

            <span className="ml-2 rounded-full bg-zlit-red/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-zlit-red">
              Admin
            </span>
          </NavLink>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zlit-muted hover:bg-white/5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.2em] text-zlit-muted">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.links.map(
                  ({ label, path, icon: Icon, badge }) => (
                    <NavLink
                      key={path}
                      to={path}
                      end={path === "/admin"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-pill px-3 py-2.5 text-xs font-medium transition ${
                          isActive
                            ? "bg-zlit-red text-white"
                            : "text-zlit-muted hover:bg-white/[0.05] hover:text-zlit-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={16} strokeWidth={1.8} />

                          <span className="flex-1">
                            {label}
                          </span>

                          {badge && pendingOrders > 0 && (
                            <span
                              aria-label={`${pendingOrders} pending orders`}
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                isActive
                                  ? "bg-white text-zlit-red"
                                  : "bg-zlit-red text-white"
                              }`}
                            >
                              {pendingOrders > 99
                                ? "99+"
                                : pendingOrders}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-pill px-3 py-3 text-xs font-medium text-zlit-muted transition hover:bg-white/5 hover:text-red-400"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

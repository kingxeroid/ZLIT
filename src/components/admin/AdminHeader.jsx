import { useLocation } from "react-router-dom";
import { Menu, Search, Bell, ExternalLink } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/collections": "Collections",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/reviews": "Reviews",
  "/admin/coupons": "Coupons",
  "/admin/messages": "Messages",
  "/admin/newsletter": "Newsletter",
  "/admin/lookbook": "Lookbook",
  "/admin/activity-logs": "Activity Logs",
  "/admin/settings": "Settings",
};

export default function AdminHeader({ onMenuClick = () => {} }) {
  const location = useLocation();
  const { profile } = useAuth();

  const title = pageTitles[location.pathname] || "Admin";

  const initials = (profile?.full_name || "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.06] bg-[#171719]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open admin menu"
          className="rounded-full p-2 text-zlit-muted hover:bg-white/5 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="font-display text-lg font-semibold text-zlit-white">
            {title}
          </h1>
          <p className="hidden text-[10px] text-zlit-muted sm:block">
            ZLIT / Administration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          aria-label="Search"
          className="rounded-full p-2.5 text-zlit-muted transition hover:bg-white/5 hover:text-white"
        >
          <Search size={17} />
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-full p-2.5 text-zlit-muted transition hover:bg-white/5 hover:text-white"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-zlit-red" />
        </button>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          aria-label="View storefront"
          className="hidden rounded-full p-2.5 text-zlit-muted transition hover:bg-white/5 hover:text-white sm:block"
        >
          <ExternalLink size={17} />
        </a>

        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-zlit-surface text-xs font-bold text-zlit-white">
          {initials}
        </div>
      </div>
    </header>
  );
}
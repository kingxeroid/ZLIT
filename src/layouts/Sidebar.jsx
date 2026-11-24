import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Heart, UserRound, Package } from "lucide-react";

const links = [
  { label: "Overview", path: "/profile", icon: LayoutDashboard },
  { label: "My Orders", path: "/orders", icon: Package },
  { label: "Wishlist", path: "/wishlist", icon: Heart },
  { label: "Shop", path: "/shop", icon: ShoppingBag },
  { label: "Profile", path: "/profile", icon: UserRound },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="grid content-start gap-2">
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={label}
          to={path}
          onClick={onNavigate}
          end={path === "/profile"}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-full px-4 py-3 text-xs font-medium transition ${
              isActive
                ? "bg-zlit-white text-zlit-bg"
                : "text-zlit-muted hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
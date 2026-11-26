
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  UserRound,
  Heart,
  LogOut,
  Package,
  LayoutDashboard,
  Home,
  Store,
  Layers,
  BookImage,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import useCart from "../../hooks/useCart";

const exploreLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Shop", path: "/shop", icon: Store },
  { name: "Collections", path: "/collections", icon: Layers },
  { name: "Lookbook", path: "/lookbook", icon: BookImage },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, profile, logout } = useAuth();
  const { totalItems = 0 } = useCart();
  const navigate = useNavigate();

  const isAdmin = user && profile?.role === "admin";

  const closeSidebar = () => setMobileOpen(false);

  const handleLogout = async () => {
    try {
      closeSidebar();
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const accountName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "My Account";

  const accountLinks = user
    ? [
        { name: "My Profile", path: "/profile", icon: UserRound },
        { name: "My Orders", path: "/orders", icon: Package },
        { name: "Wishlist", path: "/wishlist", icon: Heart },
        ...(isAdmin
          ? [
              {
                name: "Admin Dashboard",
                path: "/admin",
                icon: LayoutDashboard,
              },
            ]
          : []),
      ]
    : [];

  const CartLink = ({ mobile = false }) => (
    <Link
      to="/cart"
      onClick={mobile ? closeSidebar : undefined}
      aria-label={`Shopping bag, ${totalItems} items`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        mobile
          ? "text-white hover:bg-white/5"
          : "text-zlit-muted hover:bg-white/5 hover:text-white"
      }`}
    >
      <ShoppingBag size={19} />

      {totalItems > 0 && (
        <span
          className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zlit-red px-1 text-[10px] font-bold text-white ${
            mobile ? "ring-2 ring-[#1D1D20]" : "ring-2 ring-[#171719]"
          }`}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* Desktop / Mobile Header */}
      <header className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#171719]">
        <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-8 lg:px-12">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex shrink-0 items-center"
          >
            <img
              src="/logo.webp"
              alt="ZLIT"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {exploreLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-zlit-muted hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Admin Dashboard - Admin Only */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "text-zlit-red"
                      : "text-zlit-muted hover:text-zlit-red"
                  }`
                }
              >
                <LayoutDashboard size={16} />
                Admin Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zlit-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <Heart size={19} />
            </Link>

            <CartLink />

            {user ? (
              <>
                <Link
                  to="/profile"
                  aria-label="My account"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zlit-surface text-white"
                >
                  <UserRound size={18} />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-zlit-muted transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="zl-primary ml-2">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <CartLink />

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zlit-surface text-white transition-colors hover:bg-white/10 active:scale-95"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={closeSidebar}
        className={`fixed inset-0 z-[200] bg-black/60 transition-opacity duration-200 md:hidden ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile Sidebar */}
      <aside
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-[201] flex w-[260px] max-w-[85vw] flex-col border-r border-white/[0.06] bg-[#1D1D20] shadow-2xl transition-transform duration-200 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center"
          >
            <img
              src="/logo.webp"
              alt="ZLIT"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close navigation"
            className="rounded-full p-2 text-zlit-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Account Information */}
        {user && (
          <div className="shrink-0 border-b border-white/[0.06] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zlit-red font-display text-lg font-bold text-white">
                {accountName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {accountName}
                </p>

                <p className="truncate text-xs text-zlit-muted">
                  {user.email}
                </p>

                {isAdmin && (
                  <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-widest text-zlit-red">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-6">
          {/* Explore */}
          <div>
            <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.2em] text-zlit-muted">
              EXPLORE
            </p>

            <div className="space-y-1">
              {exploreLinks.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-pill px-3 py-2.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-zlit-red text-white"
                        : "text-zlit-muted hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span className="flex-1">{name}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Account */}
          {user && (
            <div>
              <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.2em] text-zlit-muted">
                MY ACCOUNT
              </p>

              <div className="space-y-1">
                {accountLinks.map(({ name, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-pill px-3 py-2.5 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-zlit-red text-white"
                          : "text-zlit-muted hover:bg-white/[0.05] hover:text-white"
                      }`
                    }
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    <span className="flex-1">{name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Shopping */}
          <div>
            <p className="mb-3 px-3 text-[9px] font-bold tracking-[0.2em] text-zlit-muted">
              SHOPPING
            </p>

            <div className="space-y-1">
              <NavLink
                to="/cart"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-pill px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zlit-red text-white"
                      : "text-zlit-muted hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                <ShoppingBag size={16} strokeWidth={1.8} />
                <span className="flex-1">Shopping Bag</span>

                {totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zlit-red px-1.5 text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/wishlist"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-pill px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zlit-red text-white"
                      : "text-zlit-muted hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                <Heart size={16} strokeWidth={1.8} />
                <span className="flex-1">Wishlist</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 space-y-2 border-t border-white/[0.06] p-4">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-pill px-3 py-3 text-xs font-medium text-zlit-muted transition-colors hover:bg-white/5 hover:text-red-400"
            >
              <LogOut size={16} />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              onClick={closeSidebar}
              className="flex w-full items-center gap-3 rounded-pill px-3 py-3 text-xs font-medium text-zlit-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <UserRound size={16} />
              Sign in
            </Link>
          )}

          <p className="px-3 pt-2 text-[9px] font-bold tracking-[0.15em] text-zlit-muted">
            ZLIT · DEFINE YOUR STYLE
          </p>
        </div>
      </aside>
    </>
  );
}

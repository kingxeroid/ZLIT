
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  UserRound,
  Heart,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import useCart  from "../../hooks/useCart";

const links = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Collections", path: "/collections" },
  { name: "Lookbook", path: "/lookbook" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, profile, logout } = useAuth();
  const { totalItems = 0 } = useCart();

  const navigate = useNavigate();

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

  const accountLinks = [
    { name: "My Profile", path: "/profile", icon: UserRound },
    { name: "My Orders", path: "/orders", icon: Package },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    ...(profile?.role === "admin"
      ? [{ name: "Admin Dashboard", path: "/admin", icon: LayoutDashboard }]
      : []),
  ];

  const accountName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "My Account";

  const CartLink = ({ mobile = false }) => (
    <Link
      to="/cart"
      aria-label={`Shopping bag, ${totalItems} items`}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        mobile
          ? "text-white"
          : "text-zlit-muted hover:bg-white/5 hover:text-white"
      }`}
    >
      <ShoppingBag size={19} />

      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zlit-red px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#171719]">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#171719]/95">
        <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-8 lg:px-12">

          {/* LOGO */}
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

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
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
          </nav>

          {/* DESKTOP ACTIONS */}
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

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-2 md:hidden">
            <CartLink mobile />

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zlit-surface text-white active:scale-95"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden">
            {/* BACKDROP */}
            <motion.button
              type="button"
              aria-label="Close navigation"
              onClick={closeSidebar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[200] bg-black/65"
            />

            {/* DRAWER */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed right-0 top-0 z-[201] flex h-[100dvh] w-[85%] max-w-[360px] flex-col overflow-hidden border-l border-white/10 bg-[#171719] shadow-2xl"
              style={{ willChange: "transform" }}
            >
              {/* SIDEBAR HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-5">
                <Link to="/" onClick={closeSidebar}>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zlit-surface text-white transition-colors hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* USER DETAILS */}
              {user && (
                <div className="shrink-0 border-b border-white/10 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zlit-red font-display text-lg font-bold text-white">
                      {accountName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {accountName}
                      </p>
                      <p className="truncate text-xs text-zlit-muted">
                        {user.email}
                      </p>

                      {profile?.role === "admin" && (
                        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zlit-red">
                          Administrator
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SCROLLABLE CONTENT */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zlit-muted">
                  Explore
                </p>

                <div className="space-y-1">
                  {links.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === "/"}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-zlit-red/10 text-white"
                            : "text-zlit-muted hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {link.name}
                      <ChevronRight size={16} className="opacity-40" />
                    </NavLink>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="my-6 border-t border-white/10" />

                    <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zlit-muted">
                      My Account
                    </p>

                    <div className="space-y-1">
                      {accountLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              `flex min-h-12 items-center justify-between rounded-xl px-4 transition-colors ${
                                isActive
                                  ? "bg-zlit-red/10 text-white"
                                  : "text-zlit-muted hover:bg-white/5 hover:text-white"
                              }`
                            }
                          >
                            <span className="flex items-center gap-3 text-sm font-medium">
                              <Icon size={17} />
                              {item.name}
                            </span>
                            <ChevronRight size={16} className="opacity-40" />
                          </NavLink>
                        );
                      })}
                    </div>
                  </>
                )}

                {!user && (
                  <Link
                    to="/login"
                    onClick={closeSidebar}
                    className="zl-primary mt-6 flex w-full justify-center"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* SIDEBAR FOOTER */}
              <div className="shrink-0 border-t border-white/10 p-5">
                {user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                )}

                <p className="mt-4 text-center text-[9px] tracking-[0.2em] text-zlit-muted">
                  ZLIT · DEFINE YOUR STYLE
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

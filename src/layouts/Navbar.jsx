import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  UserRound,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "Lookbook", path: "/lookbook" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zlit-bg/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="w-fit font-display text-2xl font-bold tracking-tighter">
          ZL<span className="text-zlit-red">IT</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-zlit-surface p-1 lg:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-zlit-white text-zlit-bg"
                    : "text-zlit-muted hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            to="/wishlist"
            className="hidden h-10 w-10 place-items-center rounded-full bg-zlit-surface hover:text-zlit-red sm:grid"
            aria-label="Wishlist"
          >
            <Heart size={17} />
          </Link>

          <Link
            to="/cart"
            className="grid h-10 w-10 place-items-center rounded-full bg-zlit-surface hover:text-zlit-red"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={17} />
          </Link>

          {user ? (
            <Link
              to="/profile"
              className="hidden h-10 w-10 place-items-center rounded-full bg-zlit-surface sm:grid"
              aria-label="Profile"
            >
              <UserRound size={17} />
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-zlit-red px-5 py-2.5 text-xs font-bold sm:block"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="grid h-10 w-10 place-items-center rounded-full bg-zlit-surface lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-3 right-3 top-[68px] grid gap-1 rounded-[24px] border border-white/10 bg-zlit-surface p-3 shadow-2xl lg:hidden"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={close}
                className={({ isActive }) =>
                  `rounded-full px-5 py-3 text-sm ${
                    isActive
                      ? "bg-zlit-white text-zlit-bg"
                      : "text-zlit-muted"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <>
                <Link to="/orders" onClick={close} className="rounded-full px-5 py-3 text-sm">
                  My orders
                </Link>

                {profile?.role === "admin" && (
                  <Link to="/admin" onClick={close} className="rounded-full px-5 py-3 text-sm">
                    Admin dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full px-5 py-3 text-left text-sm text-zlit-red"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={close} className="rounded-full bg-zlit-red px-5 py-3 text-center text-sm font-semibold">
                Sign in
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminModal, setAdminModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (type, message) => {
    setToast({ type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const result = await login({ email, password });

      notify("success", "Signed in successfully.");

      if (result.profile.role === "admin") {
        setAdminModal(true);
      } else {
        navigate("/");
      }
    } catch (err) {
      notify("error", err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Toast notification */}
      <div className="pointer-events-none fixed right-4 top-4 z-[300] w-[calc(100%-2rem)] max-w-sm">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border p-4 shadow-xl ${
                toast.type === "success"
                  ? "border-emerald-500/20 bg-[#17231e] text-emerald-400"
                  : "border-red-500/20 bg-[#251719] text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={19} className="shrink-0" />
              ) : (
                <AlertCircle size={19} className="shrink-0" />
              )}

              <p className="flex-1 text-sm text-white">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-zlit-muted transition-colors hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero */}
      <div className="relative hidden overflow-hidden bg-zlit-surface lg:block">
        <img
          src="/images/hero/auth-cover.jpg"
          alt="ZLIT collection"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        <div className="absolute bottom-14 left-14">
          <h2 className="font-display text-6xl font-bold tracking-tighter">
            OWN
            <br />
            YOUR LOOK.
          </h2>
        </div>
      </div>

      {/* Login form */}
      <div className="grid place-items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="font-display text-3xl font-bold">
            ZL<span className="text-zlit-red">IT</span>
          </Link>

          <div className="mb-8 mt-14">
            <h1 className="font-display text-3xl font-bold">
              Welcome back.
            </h1>
            <p className="mt-2 text-sm text-zlit-muted">
              Sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid gap-2">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex items-center gap-2 text-xs text-zlit-muted"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPassword ? "Hide password" : "Show password"}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-zlit-red">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign in <ArrowRight size={15} />
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-zlit-muted">
            New to ZLIT?{" "}
            <Link to="/register" className="font-semibold text-zlit-white">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Admin modal */}
      <AnimatePresence>
        {adminModal && (
          <motion.div
            className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdminModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-modal border border-white/10 bg-zlit-surface p-6"
            >
              <button
                onClick={() => setAdminModal(false)}
                className="absolute right-5 top-5 text-zlit-muted"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <ShieldCheck size={30} className="text-zlit-red" />

              <h2 className="mt-5 font-display text-xl font-bold">
                Admin account detected
              </h2>

              <p className="mt-2 text-sm text-zlit-muted">
                Choose where you want to continue.
              </p>

              <div className="mt-6 grid gap-3">
                <Button
                  onClick={() => navigate("/admin")}
                  className="w-full"
                >
                  <ShieldCheck size={16} /> Admin dashboard
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  <UserRound size={16} /> Customer storefront
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

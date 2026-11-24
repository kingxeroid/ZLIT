import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      const data = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (data.session) {
        navigate("/");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-zlit-surface lg:block">
        <img
          src="/images/hero/auth-cover.jpg"
          alt="ZLIT streetwear"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute bottom-14 left-14">
          <h2 className="font-display text-6xl font-bold tracking-tighter">
            DEFINE
            <br />
            YOUR STYLE.
          </h2>
          <p className="mt-4 text-sm text-white/60">
            ZLIT — Built for expression.
          </p>
        </div>
      </div>

      <div className="grid place-items-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="font-display text-3xl font-bold">
            ZL<span className="text-zlit-red">IT</span>
          </Link>

          {success ? (
            <div className="mt-14">
              <h1 className="font-display text-3xl font-bold">
                Check your email.
              </h1>
              <p className="mt-3 text-sm text-zlit-muted">
                We sent you a confirmation link to activate your account.
              </p>
              <Link to="/login" className="mt-8 inline-block text-sm text-zlit-red">
                Return to login <ArrowRight className="inline" size={15} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 mt-12">
                <h1 className="font-display text-3xl font-bold">
                  Create account
                </h1>
                <p className="mt-2 text-sm text-zlit-muted">
                  Join the ZLIT community.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5">
                <Input
                  label="Full name"
                  name="fullName"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-xs text-zlit-muted"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  {showPassword ? "Hide password" : "Show password"}
                </button>

                {error && (
                  <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Create account <ArrowRight size={15} />
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-zlit-muted">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-zlit-white">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
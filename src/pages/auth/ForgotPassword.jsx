import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await authService.resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="font-display text-3xl font-bold">
          ZL<span className="text-zlit-red">IT</span>
        </Link>

        {success ? (
          <div className="mt-14">
            <CheckCircle2 size={38} className="text-green-400" />

            <h1 className="mt-6 font-display text-2xl font-bold">
              Check your email.
            </h1>

            <p className="mt-3 text-sm text-zlit-muted">
              If an account exists for {email}, a password reset link will be sent.
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 text-sm text-zlit-red"
            >
              <ArrowLeft size={15} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 mt-14">
              <Mail size={28} className="text-zlit-red" />

              <h1 className="mt-5 font-display text-2xl font-bold">
                Forgot password?
              </h1>

              <p className="mt-2 text-sm text-zlit-muted">
                Enter your email to receive a reset link.
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

              {error && (
                <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Send reset link
              </Button>
            </form>

            <Link
              to="/login"
              className="mt-8 flex items-center justify-center gap-2 text-xs text-zlit-muted"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
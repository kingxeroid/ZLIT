import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LockKeyhole, CheckCircle2 } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { authService } from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return setError("Password must contain at least 8 characters.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await authService.updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Password update failed.");
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
              Password updated.
            </h1>

            <p className="mt-2 text-sm text-zlit-muted">
              Your password has been changed successfully.
            </p>

            <Button
              className="mt-8 w-full"
              onClick={() => navigate("/login")}
            >
              Continue to login
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 mt-14">
              <LockKeyhole size={28} className="text-zlit-red" />

              <h1 className="mt-5 font-display text-2xl font-bold">
                New password
              </h1>

              <p className="mt-2 text-sm text-zlit-muted">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <Input
                label="New password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && (
                <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Update password
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
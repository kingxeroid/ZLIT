import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Profile() {
  const { user, profile, loadProfile } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    });
  }, [profile]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await loadProfile(user.id);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">
          ACCOUNT SETTINGS
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">My profile.</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-card bg-zlit-surface p-5 sm:p-7"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zlit-red font-display text-xl font-bold">
            {(form.full_name || user?.email || "Z").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {form.full_name || "ZLIT customer"}
            </p>
            <p className="truncate text-xs text-zlit-muted">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            placeholder="Your full name"
            required
          />

          <Input
            label="Email address"
            value={user?.email || ""}
            disabled
          />

          <Input
            label="Phone number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Your phone number"
          />
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-green-500/10 p-3 text-xs text-green-400">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-zlit-red/10 p-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="mt-6">
          Save changes
        </Button>
      </form>
    </section>
  );
}
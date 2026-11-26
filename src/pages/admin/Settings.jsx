
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import useAuth from "../../hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("0");

  const [loading, setLoading] = useState(true);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingSetting, setSavingSetting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("site_settings")
      .select("*")
      .order("setting_key");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const settings = data || [];
      setRows(settings);

      const feeSetting = settings.find(
        (item) => item.setting_key === "delivery_fee"
      );

      if (feeSetting) {
        setDeliveryFee(String(Number(feeSetting.setting_value) || 0));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveDeliveryFee = async (e) => {
    e.preventDefault();

    const amount = Number(deliveryFee);

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Enter a valid delivery fee.");
      return;
    }

    setSavingDelivery(true);
    setError("");
    setSuccess("");

    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert(
        {
          setting_key: "delivery_fee",
          setting_value: amount,
          description: "Global delivery fee applied to customer orders.",
          updated_by: user?.id,
        },
        { onConflict: "setting_key" }
      );

    if (saveError) {
      setError(saveError.message);
    } else {
      setSuccess("Global delivery fee updated successfully.");
      await load();
    }

    setSavingDelivery(false);
  };

  const save = async (e) => {
    e.preventDefault();

    let parsed;

    try {
      parsed = JSON.parse(value);
    } catch {
      setError("Setting value must be valid JSON.");
      return;
    }

    setSavingSetting(true);
    setError("");
    setSuccess("");

    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert(
        {
          setting_key: key.trim(),
          setting_value: parsed,
          description,
          updated_by: user?.id,
        },
        { onConflict: "setting_key" }
      );

    if (saveError) {
      setError(saveError.message);
    } else {
      setKey("");
      setValue("");
      setDescription("");
      setSuccess("Setting saved successfully.");
      await load();
    }

    setSavingSetting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Site settings
        </h1>
        <p className="mt-1 text-xs text-zlit-muted">
          Manage store-wide settings and configurations.
        </p>
      </div>

      {/* GLOBAL DELIVERY FEE */}
      <form
        onSubmit={saveDeliveryFee}
        className="space-y-4 rounded-card bg-zlit-surface p-5"
      >
        <div>
          <h2 className="text-sm font-bold">
            Global delivery fee
          </h2>
          <p className="mt-1 text-xs text-zlit-muted">
            This is the delivery charge applied to customer orders.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs text-zlit-muted">
            Delivery fee (₦)
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            placeholder="e.g. 2500"
            className="zl-input"
          />
        </div>

        <button
          type="submit"
          disabled={savingDelivery || loading}
          className="zl-primary disabled:opacity-50"
        >
          {savingDelivery ? "Saving..." : "Save delivery fee"}
        </button>
      </form>

      {/* GENERAL SETTINGS */}
      <form
        onSubmit={save}
        className="space-y-3 rounded-card bg-zlit-surface p-5"
      >
        <h2 className="text-sm font-bold">
          Add general setting
        </h2>

        <input
          required
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Setting key"
          className="zl-input"
        />

        <textarea
          required
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='JSON value, e.g. "hello" or {"phone":"..."}'
          className="w-full rounded-2xl border border-white/10 bg-zlit-bg p-4 text-xs"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="zl-input"
        />

        <button
          disabled={savingSetting}
          className="zl-primary disabled:opacity-50"
        >
          {savingSetting ? "Saving..." : "Save setting"}
        </button>
      </form>

      {error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl bg-green-500/10 p-3 text-xs text-green-300">
          {success}
        </p>
      )}

      {/* SAVED SETTINGS */}
      <div className="rounded-card bg-zlit-surface p-5">
        <h2 className="mb-3 text-sm font-bold">
          Saved settings
        </h2>

        {loading ? (
          <p className="text-xs text-zlit-muted">
            Loading settings...
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-zlit-muted">
            No settings have been saved yet.
          </p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="border-b border-white/5 py-3 last:border-0"
            >
              <p className="text-xs font-bold">
                {r.setting_key}
              </p>

              <pre className="mt-2 overflow-x-auto text-[10px] text-zlit-muted">
                {JSON.stringify(r.setting_value, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

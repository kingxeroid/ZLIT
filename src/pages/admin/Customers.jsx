import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../services/supabase";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // Fetch customer profiles.
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, role, is_active, created_at"
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Filter customer accounts in JavaScript so the page
      // does not silently return zero due to a role mismatch.
      const customers = (data || []).filter(
        (profile) =>
          String(profile.role || "").toLowerCase() === "customer"
      );

      setRows(customers);
    } catch (err) {
      console.error("Customers loading error:", err);
      setError(err.message || "Unable to load customers.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();

    // Listen for newly created or updated customer profiles.
    const channel = supabase
      .channel("admin-customers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => loadCustomers(true)
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((customer) => {
      const searchableText = [
        customer.full_name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [rows, search]);

  const activeCustomers = rows.filter(
    (customer) => customer.is_active
  ).length;

  const disabledCustomers = rows.length - activeCustomers;

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Customers
          </h1>

          <p className="mt-1 text-xs text-zlit-muted">
            Manage and view registered customer accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadCustomers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full bg-zlit-surface px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-card bg-zlit-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zlit-muted">
              Total customers
            </p>
            <Users size={18} className="text-zlit-red" />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {loading ? "—" : rows.length}
          </p>
        </div>

        <div className="rounded-card bg-zlit-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zlit-muted">
              Active customers
            </p>
            <UserRound size={18} className="text-green-400" />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {loading ? "—" : activeCustomers}
          </p>
        </div>

        <div className="rounded-card bg-zlit-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zlit-muted">
              Disabled accounts
            </p>
            <UserRound size={18} className="text-red-400" />
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {loading ? "—" : disabledCustomers}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zlit-muted"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email or phone..."
          className="zl-input w-full pl-11"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-400">
              Could not load customers
            </p>

            <p className="mt-1 break-words text-xs text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadCustomers(true)}
              className="mt-3 text-xs font-bold text-white underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Customer list */}
      <div className="overflow-hidden rounded-card bg-zlit-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Registered customers
            </h2>

            <p className="mt-1 text-[11px] text-zlit-muted">
              {loading
                ? "Loading customer records..."
                : `${filteredCustomers.length} customer${
                    filteredCustomers.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <Users size={18} className="text-zlit-muted" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <RefreshCw
              size={22}
              className="animate-spin text-zlit-red"
            />

            <p className="text-xs text-zlit-muted">
              Loading customers...
            </p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-xs text-zlit-muted">
              Customer records could not be retrieved.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Users size={24} className="text-zlit-muted" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-white">
              {search
                ? "No matching customers"
                : "No customers found"}
            </h3>

            <p className="mt-2 max-w-xs text-xs leading-5 text-zlit-muted">
              {search
                ? "Try another name, email address or phone number."
                : "Customer accounts will appear here after they register."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-xs font-bold text-zlit-red"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col justify-between gap-4 p-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5">
                    <UserRound
                      size={19}
                      className="text-zlit-muted"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {customer.full_name || "Unnamed customer"}
                    </p>

                    <div className="mt-2 space-y-1.5">
                      <p className="flex items-center gap-2 break-all text-xs text-zlit-muted">
                        <Mail size={12} className="shrink-0" />
                        {customer.email || "No email"}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-zlit-muted">
                        <Phone size={12} className="shrink-0" />
                        {customer.phone || "No phone"}
                      </p>

                      <p className="flex items-center gap-2 text-xs text-zlit-muted">
                        <CalendarDays
                          size={12}
                          className="shrink-0"
                        />
                        Joined {formatDate(customer.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                      customer.is_active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {customer.is_active ? "Active" : "Disabled"}
                  </span>

                  <span className="text-[10px] text-zlit-muted">
                    Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
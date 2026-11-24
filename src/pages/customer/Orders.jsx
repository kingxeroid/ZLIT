import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import Loader from "../../components/common/Loader";

const statusStyles = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  processing: "bg-purple-500/10 text-purple-400",
  shipped: "bg-cyan-500/10 text-cyan-400",
  delivered: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!user?.id) return;

      setLoading(true);
      setError("");

      try {
        const result = await orderService.getMyOrders(user.id);
        if (active) setOrders(result);
      } catch (err) {
        if (active) setError(err.message || "Unable to load your orders.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [user?.id]);

  if (loading) return <Loader />;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">
          YOUR ACCOUNT
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">My orders.</h1>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-zlit-red/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = String(order.status || "pending").toLowerCase();

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-zlit-surface p-5 transition hover:bg-zlit-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <Package size={20} className="text-zlit-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Order #{order.order_number || String(order.id).slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zlit-muted">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${
                      statusStyles[status] || "bg-white/10 text-zlit-muted"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-sm font-bold">
                    ₦{Number(order.total_amount || 0).toLocaleString("en-NG")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-card bg-zlit-surface px-5 py-16 text-center">
          <Package className="mx-auto text-zlit-muted" size={34} />
          <h2 className="mt-4 font-display text-xl font-bold">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-zlit-muted">
            Your orders will appear here after you place one.
          </p>
          <Link to="/shop" className="zl-primary mt-6 inline-flex">
            Explore the store
          </Link>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-5 flex items-center gap-2 text-xs text-zlit-muted hover:text-white"
      >
        <RefreshCw size={13} /> Refresh orders
      </button>
    </section>
  );
}
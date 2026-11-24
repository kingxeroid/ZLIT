import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageCheck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { orderService } from "../../services/orderService";
import Loader from "../../components/common/Loader";

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!user?.id || !id) return;

      setLoading(true);
      setError("");

      try {
        const result = await orderService.getOrder(id, user.id);
        if (active) setOrder(result);
      } catch (err) {
        if (active) setError(err.message || "Unable to load this order.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  if (loading) return <Loader />;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          Order unavailable
        </h1>
        <p className="mt-2 text-sm text-zlit-muted">
          {error || "We couldn't find this order."}
        </p>
        <Link to="/orders" className="zl-primary mt-6 inline-flex">
          Back to orders
        </Link>
      </div>
    );
  }

  const status = String(order.status || "pending").toLowerCase();
  const currentStep = steps.indexOf(status);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/orders"
        className="mb-7 inline-flex items-center gap-2 text-xs text-zlit-muted hover:text-white"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zlit-red">
            ORDER DETAILS
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            Order #{order.order_number || String(order.id).slice(0, 8)}
          </h1>
        </div>

        <span className="rounded-full bg-white/10 px-4 py-2 text-xs capitalize">
          {status}
        </span>
      </div>

      <div className="rounded-card bg-zlit-surface p-5 sm:p-7">
        <div className="mb-7 flex items-center gap-3">
          <PackageCheck className="text-zlit-red" size={23} />
          <div>
            <h2 className="text-sm font-bold">Order progress</h2>
            <p className="mt-1 text-xs text-zlit-muted">
              Status updates are managed by the ZLIT team.
            </p>
          </div>
        </div>

        {status === "cancelled" ? (
          <p className="rounded-2xl bg-zlit-red/10 p-4 text-sm text-red-400">
            This order has been cancelled.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, index) => (
              <div key={step}>
                <div
                  className={`mb-2 h-1.5 rounded-full ${
                    currentStep >= index ? "bg-zlit-red" : "bg-white/10"
                  }`}
                />
                <p className="break-words text-[10px] capitalize text-zlit-muted">
                  {step}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="mb-4 text-sm font-bold">Items</h2>

          <div className="space-y-4">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.product_name || item.name || "Product"}
                  </p>
                  <p className="mt-1 text-xs text-zlit-muted">
                    Quantity: {item.quantity || 1}
                    {item.size ? ` · Size: ${item.size}` : ""}
                  </p>
                </div>
                <span className="font-semibold">
                  ₦
                  {Number(
                    item.subtotal ||
                      Number(item.unit_price || item.price || 0) *
                        Number(item.quantity || 1)
                  ).toLocaleString("en-NG")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex justify-between border-t border-white/10 pt-5 font-bold">
          <span>Total</span>
          <span>₦{Number(order.total_amount || 0).toLocaleString("en-NG")}</span>
        </div>
      </div>
    </section>
  );
}
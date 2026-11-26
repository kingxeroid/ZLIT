
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Package,
  Copy,
  Check,
  UserRound,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  ClipboardList,
} from "lucide-react";

import { orderService } from "../../services/orderService";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [copiedPhone, setCopiedPhone] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      setOrders(await orderService.listAll());
    } catch (e) {
      setError(e.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (order, status) => {
    setBusy(order.id);
    setError("");

    try {
      await orderService.updateStatus(order.id, status);
      await load();
    } catch (e) {
      setError(e.message || "Could not update order.");
      console.error(e)
    } finally {
      setBusy("");
    }
  };

  const copyPhone = async (phone, orderId) => {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(orderId);

      setTimeout(() => {
        setCopiedPhone((current) =>
          current === orderId ? "" : current
        );
      }, 2000);
    } catch {
      setError("Could not copy phone number. Please copy it manually.");
    }
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== "object") {
      return address || "No delivery address provided";
    }

    return [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") || "No delivery address provided";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Orders
          </h1>

          <p className="mt-1 text-xs text-zlit-muted">
            Review customer information and manage order fulfilment.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-full bg-zlit-surface p-3 transition hover:bg-zlit-hover disabled:opacity-50"
          aria-label="Refresh orders"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* Orders */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-card bg-zlit-surface p-10 text-center text-xs text-zlit-muted">
            Loading orders...
          </div>
        ) : orders.length ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-card bg-zlit-surface"
            >
              {/* Order heading */}
              <div className="flex flex-col gap-4 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="text-sm font-bold">
                    {order.order_number}
                  </p>

                  <p className="mt-1 text-[11px] text-zlit-muted">
                    Placed{" "}
                    {new Date(order.created_at).toLocaleString("en-NG")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-[10px] text-zlit-muted">
                      Order total
                    </p>
                    <p className="text-sm font-bold text-zlit-red">
                      ₦{Number(order.total_amount).toLocaleString("en-NG")}
                    </p>
                  </div>

                  <select
                    disabled={busy === order.id}
                    value={order.status}
                    onChange={(e) =>
                      changeStatus(order, e.target.value)
                    }
                    className="rounded-full border border-white/10 bg-zlit-bg px-3 py-2 text-[11px] capitalize outline-none focus:border-zlit-red disabled:opacity-50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
                {/* Customer information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <UserRound size={16} className="text-zlit-red" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Customer information
                    </h3>
                  </div>

                  <div className="space-y-3 rounded-xl bg-zlit-bg p-4">
                    <div>
                      <p className="text-[10px] text-zlit-muted">
                        Full name
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {order.customer_name || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-zlit-muted">
                        <Phone size={13} />
                        <p className="text-[10px]">Phone number</p>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {order.customer_phone || "Not provided"}
                        </p>

                        {order.customer_phone && (
                          <button
                            type="button"
                            onClick={() =>
                              copyPhone(order.customer_phone, order.id)
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-full bg-zlit-surface px-3 py-2 text-[10px] font-semibold transition hover:bg-zlit-hover"
                            aria-label="Copy phone number"
                          >
                            {copiedPhone === order.id ? (
                              <>
                                <Check size={13} className="text-green-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-zlit-muted">
                        <Mail size={13} />
                        <p className="text-[10px]">Email address</p>
                      </div>

                      <p className="mt-1 break-all text-sm">
                        {order.customer_email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-zlit-red" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Delivery information
                    </h3>
                  </div>

                  <div className="rounded-xl bg-zlit-bg p-4">
                    <p className="text-[10px] text-zlit-muted">
                      Delivery address
                    </p>

                    <p className="mt-2 text-sm leading-6">
                      {formatAddress(order.shipping_address)}
                    </p>

                    {order.customer_note && (
                      <div className="mt-4 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-2 text-zlit-muted">
                          <ClipboardList size={13} />
                          <p className="text-[10px]">
                            Customer delivery notes
                          </p>
                        </div>

                        <p className="mt-2 text-xs leading-5">
                          {order.customer_note}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Order details */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-zlit-red" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Ordered products
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {order.order_items?.length ? (
                      order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl bg-zlit-bg p-3"
                        >
                          <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-zlit-surface">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package
                                  size={18}
                                  className="text-zlit-muted"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-[10px] text-zlit-muted">
                              Qty: {item.quantity}
                            </p>

                            {(item.size || item.color) && (
                              <p className="mt-1 text-[10px] text-zlit-muted">
                                {[
                                  item.size && `Size: ${item.size}`,
                                  item.color && `Color: ${item.color}`,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>

                          <p className="shrink-0 text-xs font-bold">
                            ₦{Number(item.subtotal).toLocaleString("en-NG")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-zlit-bg p-4 text-xs text-zlit-muted">
                        No order items found.
                      </p>
                    )}
                  </div>

                  {/* Payment summary */}
                  <div className="rounded-xl bg-zlit-bg p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <CreditCard size={15} className="text-zlit-red" />
                      <h3 className="text-xs font-bold">
                        Payment information
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-zlit-muted">Subtotal</span>
                        <span>
                          ₦{Number(order.subtotal || 0).toLocaleString("en-NG")}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-zlit-muted">Discount</span>
                        <span>
                          ₦{Number(order.discount_amount || 0).toLocaleString("en-NG")}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-zlit-muted">Delivery fee</span>
                        <span>
                          ₦{Number(order.delivery_fee || 0).toLocaleString("en-NG")}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 border-t border-white/5 pt-3 font-bold">
                        <span>Total</span>
                        <span className="text-zlit-red">
                          ₦{Number(order.total_amount || 0).toLocaleString("en-NG")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-white/5 pt-3">
                      <p className="text-[10px] text-zlit-muted">
                        Payment status
                      </p>

                      <p className="mt-1 text-xs font-semibold capitalize">
                        {order.payment_status || "Unknown"}
                      </p>

                      <p className="mt-3 text-[10px] text-zlit-muted">
                        Payment reference
                      </p>

                      <p className="mt-1 break-all text-xs">
                        {order.payment_reference || "Not available"}
                      </p>

                      <p className="mt-3 text-[10px] text-zlit-muted">
                        Payment method
                      </p>

                      <p className="mt-1 text-xs capitalize">
                        {order.payment_method || "Not specified"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-card bg-zlit-surface p-12 text-center">
            <Package className="mx-auto text-zlit-muted" />

            <p className="mt-3 text-sm font-semibold">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-zlit-muted">
              Customer orders will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

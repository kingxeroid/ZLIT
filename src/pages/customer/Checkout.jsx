import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

import { orderService } from "../../services/orderService";

export default function Checkout() {
  const navigate = useNavigate();

  const { items, subtotal } = useCart();
  const { user, profile } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const [form, setForm] = useState({
    fullName: profile?.full_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!items?.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setError("Please complete all required delivery details.");
      return;
    }

    try {
      setSubmitting(true);

      // Create a checkout session, NOT an order.
      const session = await orderService.createCheckoutSession({
        customer: form,
        note: form.notes,
        deliveryFee: 0,
      });

      if (!session?.id) {
        throw new Error("Could not create your checkout session.");
      }

      setRedirecting(true);

      // Initialize Paystack using the session UUID.
      const payment = await orderService.initializePayment(session.id);

      // Redirect to Paystack.
      window.location.assign(payment.authorization_url);
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err?.message ||
          "We couldn't prepare your payment. Please try again."
      );

      setSubmitting(false);
      setRedirecting(false);
    }
  };

  if (!items?.length && !redirecting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#242427] flex items-center justify-center mb-5">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Your cart is empty
        </h2>

        <p className="text-gray-400 mb-6">
          Add something to your cart before checking out.
        </p>

        <Button onClick={() => navigate("/shop")}>
          Continue shopping
        </Button>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#C8102E]/10 flex items-center justify-center mb-6">
          <LoaderCircle
            size={38}
            className="text-[#C8102E] animate-spin"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Preparing your payment
        </h2>

        <p className="text-gray-400 max-w-md">
          Your checkout details have been received. You are being
          redirected to Paystack to complete your payment securely.
        </p>

        <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
          <ShieldCheck size={17} />
          Secure payment powered by Paystack
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-8">
        <p className="text-[#C8102E] text-sm font-semibold tracking-widest uppercase mb-2">
          ZLIT CHECKOUT
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Complete your order
        </h1>

        <p className="text-gray-400 mt-2">
          Enter your details and continue to secure payment.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start"
      >
        <div className="space-y-6">
          {/* Contact information */}
          <section className="bg-[#242427] border border-white/5 rounded-2xl p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-white mb-6">
              Contact information
            </h2>

            <div className="space-y-5">
              <Input
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              <Input
                label="Phone number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </section>

          {/* Delivery details */}
          <section className="bg-[#242427] border border-white/5 rounded-2xl p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-white mb-6">
              Redeemer's University delivery details
            </h2>

            <div className="space-y-5">
              <Input
                label="Redeemer's University campus address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your campus address"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />

                <Input
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Other information we might need to reach you
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Additional delivery information (optional)"
                  className="w-full rounded-xl bg-[#171719] border border-white/10 text-white placeholder:text-gray-600 px-4 py-3 outline-none focus:border-[#C8102E] transition resize-none"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle size={18} className="animate-spin" />
                Preparing payment...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                Continue to payment
              </span>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You will be redirected to Paystack to complete your payment.
          </p>
        </div>

        {/* Order summary */}
        <aside className="bg-[#242427] border border-white/5 rounded-2xl p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-white mb-6">
            Order summary
          </h2>

          <div className="space-y-5">
            {items.map((item,i) => (
              <div
                key={item.id}
                className="flex items-center gap-4"
              >
                <div className="w-16 h-20 rounded-xl bg-[#171719] overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {item.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {item.quantity}
                  </p>

                  {item.selectedSize && (
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.selectedSize}
                    </p>
                  )}
                </div>

                <p className="text-sm font-semibold text-white whitespace-nowrap">
                  ₦
                  {(
                    Number(item.price) * Number(item.quantity)
                  ).toLocaleString("en-NG")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-6 pt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">
                ₦{Number(subtotal || 0).toLocaleString("en-NG")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Delivery fee</span>
              <span className="text-white">₦0</span>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="font-semibold text-white">
                Total
              </span>

              <span className="text-xl font-bold text-[#C8102E]">
                ₦{Number(subtotal || 0).toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} />
            Secure checkout powered by Paystack
          </div>
        </aside>
      </form>
    </div>
  );
}
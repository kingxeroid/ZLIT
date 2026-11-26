
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { orderService } from "../../services/orderService";
import useCart from "../../hooks/useCart";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref");

  const { refreshCart } = useCart();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Please wait while we confirm your payment."
  );
  const [orderNumber, setOrderNumber] = useState("");
  const [checking, setChecking] = useState(false);

  const started = useRef(false);

  const verifyPayment = useCallback(async () => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference was provided.");
      return;
    }

    setChecking(true);
    setStatus("verifying");
    setMessage("Verifying your payment with Paystack...");

    try {
      const data = await orderService.verifyPayment(reference);

      // Payment succeeded and an order was created.
      if (
        data?.success &&
        data?.order_id &&
        !data?.requires_manual_recovery
      ) {
        setOrderNumber(
          data.order_number ||
          data.order?.order_number ||
          ""
        );

        // The database confirmation function has already
        // removed purchased quantities. Fetch the remaining cart.
        try {
          await refreshCart();
        } catch (cartError) {
          console.error(
            "Cart refresh failed:",
            cartError
          );
        }

        setStatus("success");
        setMessage(
          "Your payment has been confirmed successfully. Your order has been created and your cart has been updated."
        );

        return;
      }

      // Payment received or requires manual attention.
      if (data?.requires_manual_recovery) {
        setStatus("recovery");
        setMessage(
          "Your payment requires manual review. Please contact support and provide your payment reference. Do not make another payment."
        );

        return;
      }

      // Payment was unsuccessful.
      if (
        data?.payment_status === "failed" ||
        data?.payment_status === "abandoned"
      ) {
        setStatus("failed");
        setMessage(
          "Your payment was not successful. No order was created, and your cart has been preserved."
        );

        return;
      }

      setStatus("pending");
      setMessage(
        data?.message ||
        "Your payment is not yet confirmed. Please check again shortly."
      );
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      setStatus("pending");
      setMessage(
        "We could not confirm your payment right now. Your payment may still be processing. Please check again."
      );
    } finally {
      setChecking(false);
    }
  }, [reference, refreshCart]);

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    verifyPayment();
  }, [verifyPayment]);

  return (
    <main className="min-h-screen bg-[#171719] text-white flex items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-3xl bg-[#242427] border border-white/10 p-7 sm:p-9 text-center">
        {status === "verifying" && (
          <div className="flex justify-center mb-6">
            <LoaderCircle
              size={58}
              className="animate-spin text-[#C8102E]"
            />
          </div>
        )}

        {status === "success" && (
          <div className="flex justify-center mb-6">
            <CheckCircle2
              size={64}
              className="text-green-500"
            />
          </div>
        )}

        {status === "recovery" && (
          <div className="flex justify-center mb-6">
            <AlertTriangle
              size={64}
              className="text-amber-500"
            />
          </div>
        )}

        {(status === "failed" || status === "pending") && (
          <div className="flex justify-center mb-6">
            <XCircle
              size={64}
              className="text-amber-500"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-3">
          {status === "verifying" && "Verifying Payment"}
          {status === "success" && "Payment Successful"}
          {status === "pending" && "Payment Pending"}
          {status === "failed" && "Payment Unsuccessful"}
          {status === "recovery" && "Payment Received"}
        </h1>

        <p className="text-[#929296] leading-7 mb-6">
          {message}
        </p>

        {orderNumber && status === "success" && (
          <div className="bg-black/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-[#929296] mb-1">
              Order Number
            </p>

            <p className="text-sm font-semibold">
              {orderNumber}
            </p>
          </div>
        )}

        {reference && (
          <div className="bg-black/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-[#929296] mb-1">
              Payment Reference
            </p>

            <p className="text-sm break-all">
              {reference}
            </p>
          </div>
        )}

        {status === "pending" && (
          <button
            type="button"
            onClick={verifyPayment}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#C8102E] py-3.5 font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {checking ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            {checking
              ? "Checking..."
              : "Check Payment Again"}
          </button>
        )}

        {status === "success" && (
          <Link
            to="/orders"
            className="block w-full rounded-full bg-[#C8102E] py-3.5 font-semibold hover:bg-red-700 transition"
          >
            View My Orders
          </Link>
        )}

        {status === "recovery" && (
          <Link
            to="/"
            className="block w-full rounded-full bg-[#C8102E] py-3.5 font-semibold hover:bg-red-700 transition"
          >
            Return Home
          </Link>
        )}

        {(status === "failed" || status === "pending") && (
          <Link
            to="/shop"
            className="block mt-4 text-sm text-[#929296] hover:text-white"
          >
            Return to Shop
          </Link>
        )}
      </section>
    </main>
  );
}

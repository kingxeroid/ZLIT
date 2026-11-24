import Button from "../common/Button";

export default function CartSummary({
  subtotal = 0,
  onCheckout,
  loading = false,
}) {
  return (
    <div className="rounded-card bg-zlit-surface p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold">Order summary</h2>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-zlit-muted">
          <span>Subtotal</span>
          <span>₦{Number(subtotal).toLocaleString("en-NG")}</span>
        </div>

        <div className="flex justify-between text-zlit-muted">
          <span>Delivery</span>
          <span>Arranged with seller</span>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₦{Number(subtotal).toLocaleString("en-NG")}</span>
          </div>
        </div>
      </div>

      <Button
        block
        onClick={onCheckout}
        loading={loading}
        disabled={subtotal <= 0}
        className="mt-6"
      >
        Continue to checkout
      </Button>

      <p className="mt-4 text-center text-[11px] leading-5 text-zlit-muted">
        Payment and delivery arrangements are made directly with the seller.
      </p>
    </div>
  );
}
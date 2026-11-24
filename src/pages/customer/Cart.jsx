import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import useCart from "../../hooks/useCart";

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">
          YOUR SELECTION
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Your bag.</h1>
      </div>

      {!items.length ? (
        <div className="rounded-card bg-zlit-surface px-5 py-16 text-center">
          <ShoppingBag className="mx-auto text-zlit-muted" size={32} />
          <h2 className="mt-4 font-display text-xl font-bold">
            Your bag is empty
          </h2>
          <p className="mt-2 text-sm text-zlit-muted">
            Find something that fits your style.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="zl-primary mt-6"
          >
            Explore products
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-card bg-zlit-surface px-4 sm:px-6">
            {items.map((item) => (
              <CartItem
                key={`${item.id}-${item.selectedSize || "default"}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <CartSummary
            subtotal={subtotal}
            onCheckout={() => navigate("/checkout")}
          />
        </div>
      )}
    </section>
  );
}
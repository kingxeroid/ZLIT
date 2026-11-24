import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../../components/products/ProductGrid";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

export default function Wishlist() {
  const navigate = useNavigate();
  const { items, wishlistIds, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">
          SAVED ITEMS
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Your wishlist.</h1>
        <p className="mt-2 text-sm text-zlit-muted">
          {items.length} saved {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length ? (
        <ProductGrid
          products={items}
          wishlistIds={wishlistIds}
          onProductClick={(product) =>
            navigate(`/product/${product.id}`)
          }
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
        />
      ) : (
        <div className="rounded-card bg-zlit-surface px-5 py-16 text-center">
          <Heart className="mx-auto text-zlit-muted" size={32} />
          <h2 className="mt-4 font-display text-xl font-bold">
            Nothing saved yet
          </h2>
          <p className="mt-2 text-sm text-zlit-muted">
            Save products you want to come back to.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="zl-primary mt-6"
          >
            <ShoppingBag size={15} /> Browse products
          </button>
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

import ProductGallery from "../../components/products/ProductGallery";
import ProductDetailsInfo from "../../components/products/ProductDetailsInfo";
import { productService } from "../../services/productService";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setProduct(null);

    productService
      .getById(id)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Product not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleAddToCart = async (...args) => {
    try {
      const result = await addToCart(...args);

      if (result === false) {
        notify("error", "Could not add this item to your cart.");
        return;
      }

      notify("success", "Added to your cart.");
    } catch (err) {
      notify("error", err.message || "Unable to add item to cart.");
    }
  };

  const handleToggleWishlist = async (...args) => {
    try {
      const result = await toggleWishlist(...args);

      if (result === false) {
        notify("error", "Could not update your wishlist.");
        return;
      }

      notify("success", "Wishlist updated.");
    } catch (err) {
      notify("error", err.message || "Unable to update wishlist.");
    }
  };

  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-zlit-muted">
        Loading product…
      </p>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-zlit-muted">
          {error || "This product may have been removed."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toast */}
      <div className="pointer-events-none fixed right-4 top-4 z-[300] w-[calc(100%-2rem)] max-w-sm">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border p-4 shadow-xl ${
                toast.type === "success"
                  ? "border-emerald-500/20 bg-[#17231e] text-emerald-400"
                  : "border-red-500/20 bg-[#251719] text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={19} className="shrink-0" />
              ) : (
                <AlertCircle size={19} className="shrink-0" />
              )}

              <p className="flex-1 text-sm text-white">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-zlit-muted hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <ProductGallery
          images={product.images}
          productName={product.name}
        />

        <div className="lg:py-8">
          <ProductDetailsInfo
            product={product}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlisted={isWishlisted(product.id)}
          />
        </div>
      </section>
    </>
  );
}


import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  AlertCircle,
  X,
} from "lucide-react";

import Button from "../common/Button";

export default function ProductDetailsInfo({
  product,
  onAddToCart,
  onToggleWishlist,
  wishlisted = false,
}) {
  const variants = product.variants || [];

  const sizes = product.sizes?.length
    ? product.sizes
    : [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState(
    sizes.length === 1 ? sizes[0] : ""
  );

  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSelectedSize(sizes.length === 1 ? sizes[0] : "");
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const selectedVariant = useMemo(
    () =>
      variants.find((v) => v.size === selectedSize) ||
      (!sizes.length ? variants[0] : null),
    [variants, selectedSize, sizes.length]
  );

  const stock = selectedVariant
    ? Number(selectedVariant.stock_quantity || 0)
    : Number(product.stock || 0);

  const price = Number(
    selectedVariant?.price ?? product.price ?? 0
  );

  const addToCart = () => {
    if (sizes.length && !selectedSize) {
      setNotice("Please select a size first.");
      return;
    }

    if (sizes.length && !selectedVariant) {
      setNotice("This size is currently unavailable.");
      return;
    }

    if (stock <= 0) {
      setNotice("This product is currently out of stock.");
      return;
    }

    if (quantity > stock) {
      setNotice(`Only ${stock} item(s) available.`);
      return;
    }

    onAddToCart?.({
      ...product,
      price,
      variant_id: selectedVariant?.id || null,
      selectedSize,
      quantity,
    });
  };

  return (
    <div className="space-y-6">

      {/* LIGHTWEIGHT NOTICE */}
      <div className="pointer-events-none fixed right-4 top-20 z-[250] w-[calc(100%-2rem)] max-w-sm">
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-red-500/20 bg-[#25191b] p-3 shadow-xl"
            >
              <AlertCircle
                size={18}
                className="shrink-0 text-red-400"
              />

              <p className="flex-1 text-xs text-white">
                {notice}
              </p>

              <button
                type="button"
                onClick={() => setNotice("")}
                className="text-white/40 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PRODUCT INFORMATION */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zlit-red">
          ZLIT COLLECTION
        </p>

        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xl font-bold">
            ₦{price.toLocaleString("en-NG")}
          </span>

          {product.compare_at_price && (
            <span className="text-sm text-zlit-muted line-through">
              ₦{Number(product.compare_at_price).toLocaleString("en-NG")}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm leading-7 text-zlit-muted">
        {product.description || "Designed for everyday streetwear."}
      </p>

      {/* SIZE SELECTION */}
      {sizes.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold">Select size</p>

            <span className="text-xs text-zlit-muted">
              {selectedVariant
                ? `${stock} available`
                : "Choose a size"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = variants.find(
                (v) => v.size === size
              );

              const unavailable =
                !variant ||
                Number(variant.stock_quantity) <= 0;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={unavailable}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                    setNotice("");
                  }}
                  className={`h-11 min-w-11 rounded-full border px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedSize === size
                      ? "border-zlit-red bg-zlit-red text-white"
                      : "border-white/10 bg-zlit-surface hover:border-white/40"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUANTITY */}
      <div>
        <p className="mb-3 text-xs font-semibold">Quantity</p>

        <div className="flex w-fit items-center gap-5 rounded-full bg-zlit-surface px-4 py-2">
          <button
            type="button"
            onClick={() =>
              setQuantity((value) => Math.max(1, value - 1))
            }
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>

          <span className="min-w-4 text-center text-sm">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.min(Math.max(stock, 1), value + 1)
              )
            }
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={addToCart}
          disabled={
            stock <= 0 ||
            (sizes.length > 0 && !selectedSize)
          }
          className="flex-1"
        >
          <ShoppingBag size={16} />
          {stock > 0 ? "Add to bag" : "Out of stock"}
        </Button>

        <button
          type="button"
          onClick={() => onToggleWishlist?.(product)}
          className="rounded-full border border-white/10 p-3.5 transition hover:border-zlit-red"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={18}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-zlit-red" : ""}
          />
        </button>
      </div>

      {/* PRODUCT NOTES */}
      <div className="space-y-2 border-t border-white/10 pt-5 text-xs text-zlit-muted">
        <p>• Contact the seller to arrange payment and delivery.</p>
        <p>• Orders are subject to stock availability.</p>
        <p>• Available stock: {stock}</p>
      </div>
    </div>
  );
}

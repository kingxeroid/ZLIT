import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  loading = false,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] animate-pulse rounded-[24px] bg-zlit-surface" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-zlit-surface" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-zlit-surface" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-card bg-zlit-surface px-5 py-16 text-center">
        <p className="font-display text-lg font-bold">No products found</p>
        <p className="mt-2 text-sm text-zlit-muted">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          wishlisted={wishlistIds.includes(product.id)}
        />
      ))}
    </motion.div>
  );
}
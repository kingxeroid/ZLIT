import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";

export default function ProductCard({
  product,
  onClick,
  onAddToCart,
  onToggleWishlist,
  wishlisted = false,
}) {
  const image =
    product.image_url ||
    product.image ||
    "https://placehold.co/600x750/242427/F4F4F4?text=ZLIT";

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group min-w-0"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-zlit-surface">
        <button
          type="button"
          onClick={onClick}
          className="h-full w-full"
          aria-label={`View ${product.name}`}
        >
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </button>

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-zlit-red px-3 py-1 text-[10px] font-bold uppercase">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => onToggleWishlist?.(product)}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 backdrop-blur-md transition hover:bg-zlit-red"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={16}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-white" : "text-white"}
          />
        </button>

        <button
          type="button"
          onClick={() => (product.sizes?.length ? onClick?.() : onAddToCart?.({ ...product, variant_id: product.variants?.[0]?.id || null }))}
          className="absolute bottom-3 right-3 rounded-full bg-zlit-white p-3 text-zlit-bg transition hover:bg-zlit-red hover:text-white"
          aria-label="Add to cart"
        >
          <ShoppingBag size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="mt-3 block w-full text-left"
      >
        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold">
            ₦{Number(product.price || 0).toLocaleString("en-NG")}
          </span>
          {product.compare_price && (
            <span className="text-xs text-zlit-muted line-through">
              ₦{Number(product.compare_price).toLocaleString("en-NG")}
            </span>
          )}
        </div>
      </button>
    </motion.article>
  );
}
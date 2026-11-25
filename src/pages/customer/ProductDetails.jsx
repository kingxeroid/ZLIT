import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Layers3,
} from "lucide-react";

import ProductGallery from "../../components/products/ProductGallery";
import ProductDetailsInfo from "../../components/products/ProductDetailsInfo";
import ProductGrid from "../../components/products/ProductGrid";

import { productService } from "../../services/productService";
import { supabase } from "../../services/supabase";

import useProducts from "../../hooks/useProducts";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [collections, setCollections] = useState([]);
  const [relatedIds, setRelatedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const { products: allProducts } = useProducts();
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

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setCollections([]);
      setRelatedIds([]);

      try {
        const data = await productService.getById(id);

        if (!active) return;

        setProduct(data);

        const { data: assignments, error: assignmentError } =
          await supabase
            .from("collection_products")
            .select("collection_id")
            .eq("product_id", id);

        if (assignmentError) throw assignmentError;

        if (!active) return;

        const collectionIds = [
          ...new Set((assignments || []).map((item) => item.collection_id)),
        ];

        if (!collectionIds.length) return;

        const [collectionResult, relatedResult] = await Promise.all([
          supabase
            .from("collections")
            .select("id, name, description")
            .in("id", collectionIds),

          supabase
            .from("collection_products")
            .select("product_id")
            .in("collection_id", collectionIds)
            .neq("product_id", id),
        ]);

        if (!active) return;

        if (collectionResult.error) throw collectionResult.error;
        if (relatedResult.error) throw relatedResult.error;

        setCollections(collectionResult.data || []);

        setRelatedIds([
          ...new Set(
            (relatedResult.data || []).map((item) => item.product_id)
          ),
        ]);
      } catch (err) {
        if (active) {
          setError(err.message || "Product not found.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(
        (item) =>
          relatedIds.includes(item.id) &&
          item.id !== product?.id &&
          item.is_active !== false
      )
      .slice(0, 5);
  }, [allProducts, relatedIds, product]);

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

              <p className="flex-1 text-sm text-white">{toast.message}</p>

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

          {collections.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Layers3 size={17} className="text-zlit-red" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">
                  Part of these collections
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    to={`/shop?collection=${collection.id}`}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold transition hover:border-zlit-red hover:bg-zlit-red/10"
                  >
                    {collection.name}
                    <ArrowRight
                      size={12}
                      className="ml-2 inline-block"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">
                YOU MAY ALSO LIKE
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                More from the collection.
              </h2>
            </div>

            {collections[0] && (
              <Link
                to={`/shop?collection=${collections[0].id}`}
                className="flex shrink-0 items-center gap-2 text-xs font-semibold text-zlit-muted transition hover:text-white"
              >
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          <ProductGrid
            products={relatedProducts}
            onProductClick={(item) => navigate(`/product/${item.id}`)}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            wishlistIds={relatedProducts
              .filter((item) => isWishlisted(item.id))
              .map((item) => item.id)}
          />
        </section>
      )}
    </>
  );
}
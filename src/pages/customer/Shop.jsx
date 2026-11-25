import { useMemo, useState, useEffect } from "react";
import { Search, Layers3, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ProductGrid from "../../components/products/ProductGrid";
import ProductFilters from "../../components/products/ProductFilters";

import useProducts from "../../hooks/useProducts";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import { categoryService } from "../../services/categoryService";
import { supabase } from "../../services/supabase";

export default function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const collectionId = searchParams.get("collection");

  const { products, loading, error } = useProducts();

  const [collection, setCollection] = useState(null);
  const [collectionIds, setCollectionIds] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    sort: "",
    minPrice: "",
    maxPrice: "",
  });

  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;

    categoryService
      .list()
      .then((data) => {
        if (active) setCategories(data || []);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCollection = async () => {
      if (!collectionId) {
        setCollection(null);
        setCollectionIds(null);
        setCollectionError("");
        setCollectionLoading(false);
        return;
      }

      setCollection(null);
      setCollectionIds([]);
      setCollectionError("");
      setCollectionLoading(true);

      try {
        const [collectionResult, assignmentsResult] = await Promise.all([
          supabase
            .from("collections")
            .select("id, name, description")
            .eq("id", collectionId)
            .maybeSingle(),

          supabase
            .from("collection_products")
            .select("product_id")
            .eq("collection_id", collectionId),
        ]);

        if (collectionResult.error) throw collectionResult.error;
        if (assignmentsResult.error) throw assignmentsResult.error;

        if (!active) return;

        setCollection(collectionResult.data || null);

        setCollectionIds(
          (assignmentsResult.data || []).map((item) => item.product_id)
        );
      } catch (err) {
        if (active) {
          console.error("Collection loading failed:", err);
          setCollectionError(err.message || "Could not load this collection.");
        }
      } finally {
        if (active) setCollectionLoading(false);
      }
    };

    loadCollection();

    return () => {
      active = false;
    };
  }, [collectionId]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCollection =
        !collectionId || (collectionIds || []).includes(product.id);

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        !filters.category || product.category_id === filters.category;

      const matchesMin =
        !filters.minPrice ||
        Number(product.price) >= Number(filters.minPrice);

      const matchesMax =
        !filters.maxPrice ||
        Number(product.price) <= Number(filters.maxPrice);

      return (
        matchesCollection &&
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax
      );
    });

    if (filters.sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (filters.sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (filters.sort === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    if (filters.sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, filters, collectionId, collectionIds]);

  const resetFilters = () => {
    setSearch("");
    setFilters({
      category: "",
      sort: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const isCollectionPage = Boolean(collectionId);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zlit-red">
          THE ZLIT STORE
        </p>

        {isCollectionPage ? (
          <>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-2 text-xs text-zlit-muted transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to all products
            </Link>

            <div className="mt-5 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zlit-red/10 text-zlit-red">
                <Layers3 size={21} />
              </div>

              <div>
                <h1 className="font-display text-3xl font-bold sm:text-4xl">
                  {collectionLoading
                    ? "Loading collection..."
                    : collection?.name || "Collection"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-zlit-muted">
                  {collection?.description ||
                    "Explore products from this collection."}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-display text-4xl font-bold">
              Shop all.
            </h1>

            <p className="mt-2 text-sm text-zlit-muted">
              Find your next everyday favourite.
            </p>
          </>
        )}
      </div>

      {!collectionLoading && collectionError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          {collectionError}
        </div>
      )}

      {!collectionLoading && isCollectionPage && !collection && !collectionError && (
        <div className="mb-6 rounded-2xl border border-white/10 p-5 text-sm text-zlit-muted">
          This collection could not be found.
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zlit-muted"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="zl-input pl-11"
          />
        </div>

        <ProductFilters
          categories={categories}
          filters={filters}
          setFilters={setFilters}
          onReset={resetFilters}
        />
      </div>

      {loading || collectionLoading ? (
        <p className="py-16 text-center text-sm text-zlit-muted">
          Loading products…
        </p>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-2 text-xs text-zlit-muted">
            Check your Supabase configuration and product table policies.
          </p>
        </div>
      ) : collectionError ? null : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs text-zlit-muted">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {isCollectionPage ? " in this collection" : ""}
            </p>

            {isCollectionPage && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-zlit-muted">
                Collection
              </span>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              onProductClick={(product) =>
                navigate(`/product/${product.id}`)
              }
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlistIds={products
                .filter((product) => isWishlisted(product.id))
                .map((product) => product.id)}
            />
          ) : (
            <div className="py-16 text-center">
              <h2 className="font-display text-xl font-bold">
                No products found
              </h2>

              <p className="mt-2 text-sm text-zlit-muted">
                {isCollectionPage
                  ? "No products have been assigned to this collection yet, or your filters are too restrictive."
                  : "Try changing your filters."}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="zl-primary mt-5 inline-flex"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ProductGrid from "../../components/products/ProductGrid";
import ProductFilters from "../../components/products/ProductFilters";
import useProducts from "../../hooks/useProducts";
import { categoryService } from "../../services/categoryService";
import { supabase } from "../../services/supabase";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

export default function Shop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("collection");
  const [collectionIds, setCollectionIds] = useState(null);
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "", sort: "", minPrice: "", maxPrice: "" });
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => { categoryService.list().then(setCategories).catch(console.error); }, []);
  useEffect(() => {
    let active = true;
    if (!collectionId) { setCollectionIds(null); return () => { active = false; }; }
    supabase.from("collection_products").select("product_id").eq("collection_id", collectionId)
      .then(({ data, error }) => { if (!active) return; if (error) console.error(error); setCollectionIds((data || []).map((row) => row.product_id)); });
    return () => { active = false; };
  }, [collectionId]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCollection = !collectionId || (collectionIds || []).includes(product.id);
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !filters.category || product.category_id === filters.category;
      const matchesMin = !filters.minPrice || Number(product.price) >= Number(filters.minPrice);
      const matchesMax = !filters.maxPrice || Number(product.price) <= Number(filters.maxPrice);
      return matchesCollection && matchesSearch && matchesCategory && matchesMin && matchesMax;
    });
    if (filters.sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (filters.sort === "newest") result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (filters.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, search, filters, collectionId, collectionIds]);

  const resetFilters = () => setFilters({ category: "", sort: "", minPrice: "", maxPrice: "" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zlit-red">THE ZLIT STORE</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Shop all.</h1>
        <p className="mt-2 text-sm text-zlit-muted">Find your next everyday favourite.</p>
      </div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zlit-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="zl-input pl-11" />
        </div>
        <ProductFilters categories={categories} filters={filters} setFilters={setFilters} onReset={resetFilters} />
      </div>
      {loading ? <p className="py-16 text-center text-sm text-zlit-muted">Loading products…</p> : error ? <div className="py-16 text-center"><p className="text-sm text-red-400">{error}</p><p className="mt-2 text-xs text-zlit-muted">Check your Supabase configuration and product table policies.</p></div> : <>
        <p className="mb-5 text-xs text-zlit-muted">{filteredProducts.length} products</p>
        {filteredProducts.length ? <ProductGrid products={filteredProducts} onProductClick={(product) => navigate(`/product/${product.id}`)} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlistIds={products.filter((p) => isWishlisted(p.id)).map((p) => p.id)} /> : <div className="py-16 text-center"><p className="font-display text-xl font-bold">No products found</p><p className="mt-2 text-sm text-zlit-muted">Try changing your filters.</p><Link to="/shop" onClick={resetFilters} className="zl-primary mt-5 inline-flex">Clear filters</Link></div>}
      </>}
    </section>
  );
}

import { SlidersHorizontal, X } from "lucide-react";

export default function ProductFilters({
  categories = [],
  filters,
  setFilters,
  onReset,
}) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilters = [
    filters.category,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-zlit-muted">
        <SlidersHorizontal size={15} />
        Filters
      </div>

      <select
        value={filters.category || ""}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-full border border-white/10 bg-zlit-surface px-4 py-2.5 text-xs outline-none focus:border-zlit-red"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={filters.sort || ""}
        onChange={(e) => update("sort", e.target.value)}
        className="rounded-full border border-white/10 bg-zlit-surface px-4 py-2.5 text-xs outline-none focus:border-zlit-red"
      >
        <option value="">Sort by</option>
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to high</option>
        <option value="price-high">Price: High to low</option>
        <option value="name">Name</option>
      </select>

      <input
        type="number"
        min="0"
        value={filters.minPrice || ""}
        onChange={(e) => update("minPrice", e.target.value)}
        placeholder="Min ₦"
        className="w-24 rounded-full border border-white/10 bg-zlit-surface px-4 py-2.5 text-xs outline-none focus:border-zlit-red"
      />

      <input
        type="number"
        min="0"
        value={filters.maxPrice || ""}
        onChange={(e) => update("maxPrice", e.target.value)}
        placeholder="Max ₦"
        className="w-24 rounded-full border border-white/10 bg-zlit-surface px-4 py-2.5 text-xs outline-none focus:border-zlit-red"
      />

      {activeFilters > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-xs text-zlit-red hover:bg-zlit-red/10"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}
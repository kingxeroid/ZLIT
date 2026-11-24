import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, RefreshCw, Package } from "lucide-react";
import useProducts from "../../hooks/useProducts";
import { productService } from "../../services/productService";
import { adminService } from "../../services/adminService";

export default function Products() {
  const navigate = useNavigate();
  const { products, loading, error, refresh } = useProducts({ admin: true });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [workingId, setWorkingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const filtered = useMemo(() => products.filter((product) => {
    const matches = product.name.toLowerCase().includes(search.toLowerCase()) || (product.sku || "").toLowerCase().includes(search.toLowerCase());
    const status = filter === "all" || (filter === "active" ? product.is_active : !product.is_active);
    return matches && status;
  }), [products, search, filter]);
  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setWorkingId(product.id); setActionError("");
    try { await productService.remove(product.id); await adminService.log("delete", "product", product.id, `Deleted ${product.name}`); await refresh(); }
    catch (e) { setActionError(e.message || "Could not delete product."); }
    finally { setWorkingId(null); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-2xl font-bold">Products</h1><p className="mt-1 text-xs text-zlit-muted">Manage your live product catalogue.</p></div><button onClick={() => navigate("/admin/products/add")} className="zl-primary inline-flex items-center gap-2"><Plus size={15} /> Add product</button></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-card bg-zlit-surface p-4"><p className="text-xs text-zlit-muted">Total products</p><p className="mt-2 text-2xl font-bold">{products.length}</p></div><div className="rounded-card bg-zlit-surface p-4"><p className="text-xs text-zlit-muted">Active</p><p className="mt-2 text-2xl font-bold">{products.filter((p) => p.is_active).length}</p></div><div className="col-span-2 rounded-card bg-zlit-surface p-4 sm:col-span-1"><p className="text-xs text-zlit-muted">Low stock (under 5)</p><p className="mt-2 text-2xl font-bold">{products.filter((p) => p.stock < 5).length}</p></div></div>
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zlit-muted"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or SKU…" className="zl-input pl-10"/></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-pill border border-white/10 bg-zlit-surface px-4 py-3 text-xs"><option value="all">All products</option><option value="active">Active</option><option value="inactive">Inactive / draft</option></select><button onClick={refresh} className="rounded-pill bg-zlit-surface px-4 py-3 text-xs"><RefreshCw size={14} className="inline"/> Refresh</button></div>
    {(error || actionError) && <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{actionError || error}</p>}
    <div className="overflow-hidden rounded-card bg-zlit-surface"><div className="flex items-center justify-between border-b border-white/5 px-5 py-4"><h2 className="text-sm font-semibold">All products</h2><span className="text-xs text-zlit-muted">{filtered.length} results</span></div>
      {loading ? <p className="p-8 text-center text-xs text-zlit-muted">Loading products…</p> : filtered.length ? <div className="divide-y divide-white/5">{filtered.map((product) => <div key={product.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[64px_1fr_100px_100px_auto] sm:px-5"><img src={product.image_url || "https://placehold.co/100x100/242427/F4F4F4?text=ZLIT"} alt="" className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"/><div className="min-w-0"><p className="truncate text-xs font-semibold">{product.name}</p><p className="mt-1 truncate text-[10px] text-zlit-muted">{product.sku || "No SKU"} · {product.category_name}</p><p className="mt-1 text-xs font-bold sm:hidden">₦{Number(product.price).toLocaleString("en-NG")} · {product.stock} stock</p></div><span className="hidden text-xs font-semibold sm:block">₦{Number(product.price).toLocaleString("en-NG")}</span><span className="hidden text-xs text-zlit-muted sm:block">{product.stock} units</span><div className="flex items-center gap-1"><button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="rounded-full p-2 text-zlit-muted hover:bg-white/5 hover:text-white" aria-label="Edit"><Pencil size={15}/></button><button disabled={workingId === product.id} onClick={() => remove(product)} className="rounded-full p-2 text-zlit-muted hover:bg-red-500/10 hover:text-red-400" aria-label="Delete"><Trash2 size={15}/></button></div></div>)}</div> : <div className="p-12 text-center"><Package className="mx-auto text-zlit-muted"/><p className="mt-3 text-sm font-semibold">No products yet</p><p className="mt-1 text-xs text-zlit-muted">Add products from your Supabase-backed catalogue.</p></div>}
    </div>
  </div>;
}

import { useEffect, useState } from "react";
import { ShoppingBag, Wallet, Users, Package, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
export default function Dashboard() {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { setLoading(true); setError(""); try { setStats(await adminService.dashboard()); } catch (e) { setError(e.message || "Unable to load dashboard."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const cards = [
    { label: "Total orders", value: stats?.orderCount ?? "—", icon: ShoppingBag },
    { label: "Recorded revenue", value: money(stats?.revenue), icon: Wallet },
    { label: "Customers", value: stats?.customerCount ?? "—", icon: Users },
    { label: "Products", value: stats?.productCount ?? "—", icon: Package },
  ];
  return <div className="space-y-7"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">ZLIT CONTROL</p><h1 className="mt-2 font-display text-2xl font-bold">Dashboard.</h1><p className="mt-1 text-xs text-zlit-muted">Live figures from your Supabase database.</p></div><button onClick={load} className="rounded-full bg-zlit-surface p-3"><RefreshCw size={15}/></button></div>{error && <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-card bg-zlit-surface p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-xs text-zlit-muted">{label}</p><Icon size={17} className="text-zlit-red"/></div><p className="mt-3 font-display text-2xl font-bold">{loading ? "…" : value}</p></div>)}</div><section className="overflow-hidden rounded-card bg-zlit-surface"><div className="flex items-center justify-between border-b border-white/5 px-5 py-4"><div><h2 className="text-sm font-semibold">Recent orders</h2><p className="mt-1 text-[10px] text-zlit-muted">Latest customer activity</p></div><Link to="/admin/orders" className="text-xs text-zlit-red">View all</Link></div>{loading ? <p className="p-8 text-center text-xs text-zlit-muted">Loading…</p> : stats?.recentOrders?.length ? <div className="divide-y divide-white/5">{stats.recentOrders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-xs font-semibold">{order.order_number || `Order ${order.id.slice(0, 8)}`}</p><p className="mt-1 text-[10px] capitalize text-zlit-muted">{order.status} · {new Date(order.created_at).toLocaleDateString()}</p></div><p className="text-xs font-bold">{money(order.total_amount)}</p></div>)}</div> : <p className="p-10 text-center text-xs text-zlit-muted">No orders recorded yet.</p>}</section></div>;
}

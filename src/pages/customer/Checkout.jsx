import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { orderService } from "../../services/orderService";

const initialForm = { fullName: "", email: "", phone: "", address: "", city: "", state: "", notes: "" };
export default function Checkout() {
  const navigate = useNavigate(); const { items, subtotal, clearCart } = useCart(); const { user, profile } = useAuth();
  const [form, setForm] = useState({ ...initialForm, fullName: profile?.full_name || "", email: user?.email || "", phone: profile?.phone || "" });
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(""); const [order, setOrder] = useState(null);
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError("");
    try {
      const result = await orderService.placeOrder({ customer: form, items, note: form.notes });
      setOrder(result); clearCart();
    } catch (err) { setError(err.message || "Unable to submit your order."); }
    finally { setSubmitting(false); }
  };
  if (order) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><CheckCircle2 className="mx-auto text-green-400" size={45}/><h1 className="mt-5 font-display text-2xl font-bold">Order received.</h1><p className="mt-3 text-sm text-zlit-muted">Your order <strong>{order.order_number}</strong> has been saved. The ZLIT team will contact you to arrange payment and delivery.</p><button onClick={() => navigate(`/orders/${order.id}`)} className="zl-primary mt-6">View order</button></div>;
  if (!items.length) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-2xl font-bold">Your bag is empty</h1><button onClick={() => navigate("/shop")} className="zl-primary mt-5">Browse products</button></div>;
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <button onClick={() => navigate("/cart")} className="mb-6 flex items-center gap-2 text-xs text-zlit-muted hover:text-white"><ArrowLeft size={15}/> Back to bag</button>
    <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-zlit-red">FINAL DETAILS</p><h1 className="mt-2 font-display text-3xl font-bold">Checkout.</h1></div>
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit} className="rounded-card bg-zlit-surface p-5 sm:p-7"><h2 className="mb-5 font-display text-lg font-bold">Contact information</h2><div className="space-y-4">
        <Input label="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required placeholder="Your full name"/>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Email address" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="you@example.com"/><Input label="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} required placeholder="080…"/></div>
        <h2 className="pt-4 font-display text-lg font-bold">Delivery details</h2><Input label="Delivery address" value={form.address} onChange={(e) => update("address", e.target.value)} required placeholder="Street address"/>
        <div className="grid gap-4 sm:grid-cols-2"><Input label="City" value={form.city} onChange={(e) => update("city", e.target.value)} required placeholder="City"/><Input label="State" value={form.state} onChange={(e) => update("state", e.target.value)} required placeholder="State"/></div>
        <div><label className="mb-2 block text-xs font-semibold text-zlit-muted">Additional notes</label><textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Optional delivery instructions…" className="w-full resize-none rounded-2xl border border-white/10 bg-zlit-bg px-4 py-3 text-sm outline-none focus:border-zlit-red"/></div>
      </div>{error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}<Button type="submit" block disabled={submitting} className="mt-7">{submitting ? "Submitting order…" : "Place order"}</Button></form>
      <aside className="rounded-card bg-zlit-surface p-5 sm:p-6"><h2 className="font-display text-lg font-bold">Your order</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={`${item.id}-${item.variant_id || item.selectedSize || "standard"}`} className="flex justify-between gap-3 text-xs"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-zlit-muted">{item.quantity} × {item.selectedSize || "Standard"}</p></div><span className="font-semibold">₦{(Number(item.price) * item.quantity).toLocaleString("en-NG")}</span></div>)}</div><div className="mt-5 border-t border-white/10 pt-4"><div className="flex justify-between text-sm font-bold"><span>Subtotal</span><span>₦{subtotal.toLocaleString("en-NG")}</span></div><p className="mt-3 text-xs leading-5 text-zlit-muted">No online payment is collected. The ZLIT team will contact you to arrange payment and delivery.</p></div></aside>
    </div>
  </section>;
}

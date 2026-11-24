import { supabase } from "./supabase";

export const adminService = {
  async dashboard() {
    const [products, orders, customers, revenue] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id,order_number,customer_name,status,total_amount,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("orders").select("total_amount").in("status", ["confirmed", "processing", "shipped", "delivered"]),
    ]);
    for (const result of [products, orders, customers, revenue]) {
      if (result.error) throw result.error;
    }
    return {
      productCount: products.count || 0,
      orderCount: orders.count || 0,
      customerCount: customers.count || 0,
      recentOrders: orders.data || [],
      revenue: (revenue.data || []).reduce((sum, row) => sum + Number(row.total_amount || 0), 0),
    };
  },

  async log(action, entityType, entityId = null, description = "") {
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase.from("admin_activity_logs").insert({
      admin_id: authData.user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
    });
    if (error) throw error;
  },
};

import { supabase } from "./supabase";

export const cartService = {
  async list(userId) {
    const { data, error } = await supabase.from("cart_items")
      .select("id,product_id,variant_id,quantity,products(*),product_variants(*)")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },
  async setQuantity(userId, productId, variantId, quantity) {
    let query = supabase.from("cart_items").select("id").eq("user_id", userId).eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (data) {
      const result = await supabase.from("cart_items").update({ quantity }).eq("id", data.id);
      if (result.error) throw result.error;
    } else {
      const result = await supabase.from("cart_items").insert({ user_id: userId, product_id: productId, variant_id: variantId || null, quantity });
      if (result.error) throw result.error;
    }
  },
  async remove(userId, productId, variantId) {
    let query = supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { error } = await query;
    if (error) throw error;
  },
  async clear(userId) {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (error) throw error;
  },
};

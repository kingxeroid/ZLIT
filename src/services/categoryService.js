import { supabase } from "./supabase";

export const categoryService = {
  async list({ admin = false } = {}) {
    let query = supabase.from("categories").select("*").order("sort_order").order("name");
    if (!admin) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async create(payload) {
    const { data, error } = await supabase.from("categories").insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  async update(id, payload) {
    const { data, error } = await supabase.from("categories").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
};

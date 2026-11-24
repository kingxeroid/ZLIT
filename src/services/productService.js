import { supabase } from "./supabase";

const PRODUCT_SELECT =
  "*, categories(id,name,slug), product_variants(id,size,color,color_hex,sku,price,stock_quantity,image_url,is_active)";

export const productService = {
  async list({ admin = false, limit } = {}) {
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (!admin) query = query.eq("is_active", true);
    if (Number.isInteger(limit)) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeProduct);
  },

  async getById(id, { admin = false } = {}) {
    let query = supabase.from("products").select(PRODUCT_SELECT).eq("id", id);
    if (!admin) query = query.eq("is_active", true);
    const { data, error } = await query.single();
    if (error) throw error;
    return normalizeProduct(data);
  },

  async create(payload) {
    const { variants = [], ...product } = payload;
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select("id")
      .single();
    if (error) throw error;

    if (variants.length) {
      const rows = variants.map((variant) => ({ ...variant, product_id: data.id }));
      const { error: variantError } = await supabase.from("product_variants").insert(rows);
      if (variantError) {
        await supabase.from("products").delete().eq("id", data.id);
        throw variantError;
      }
    }
    return data.id;
  },

  async update(id, payload) {
    const { variants, ...product } = payload;
    const { error } = await supabase.from("products").update(product).eq("id", id);
    if (error) throw error;

    if (variants) {
      const { data: existing, error: readError } = await supabase
        .from("product_variants").select("id").eq("product_id", id);
      if (readError) throw readError;

      if (existing?.length) {
        if (variants.length) {
          const { error: updateError } = await supabase
            .from("product_variants")
            .update({
              size: variants[0].size ?? null,
              color: variants[0].color ?? null,
              color_hex: variants[0].color_hex ?? null,
              sku: variants[0].sku ?? null,
              price: variants[0].price ?? null,
              stock_quantity: variants[0].stock_quantity ?? 0,
              image_url: variants[0].image_url ?? null,
              is_active: variants[0].is_active ?? true,
            })
            .eq("id", existing[0].id);
          if (updateError) throw updateError;
          if (existing.length > 1) {
            const { error: deleteError } = await supabase
              .from("product_variants").delete().in("id", existing.slice(1).map((row) => row.id));
            if (deleteError) throw deleteError;
          }
        } else {
          const { error: deleteError } = await supabase.from("product_variants").delete().eq("product_id", id);
          if (deleteError) throw deleteError;
        }
      } else if (variants.length) {
        const { error: insertError } = await supabase
          .from("product_variants")
          .insert(variants.map((variant) => ({ ...variant, product_id: id })));
        if (insertError) throw insertError;
      }
    }
  },

  async remove(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};

export function normalizeProduct(product) {
  const variants = (product.product_variants || []).filter((variant) => variant.is_active !== false);
  const stock = variants.reduce((sum, variant) => sum + Number(variant.stock_quantity || 0), 0);
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  return {
    ...product,
    category_name: product.categories?.name || "Uncategorised",
    compare_price: product.compare_at_price,
    image: product.image_url,
    images: images.length ? images : product.image_url ? [product.image_url] : [],
    variants,
    sizes: [...new Set(variants.map((variant) => variant.size).filter(Boolean))],
    stock,
    stock_quantity: stock,
  };
}

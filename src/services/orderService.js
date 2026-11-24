
import { supabase } from "./supabase";

export const orderService = {
  async placeOrder({ customer, items, note = "" }) {
    // Your existing SQL function reads items from Supabase cart_items.
    // It does not accept an items parameter.

    const { data: orderId, error: orderError } =
      await supabase.rpc("create_order", {
        p_customer_name: customer.fullName,
        p_customer_email: customer.email || null,
        p_customer_phone: customer.phone,
        p_shipping_address: {
          address_line1: customer.address,
          city: customer.city,
          state: customer.state,
          country: customer.country || "Nigeria",
        },
        p_customer_note: note || null,
      });

    if (orderError) throw orderError;

    // create_order returns a UUID, not an order object.
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    return order;
  },

  async getMyOrders(userId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrder(orderId, userId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async listAll() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateStatus(id, status, adminNote = null) {
    const functions = {
      confirmed: "confirm_order",
      processing: "process_order",
      shipped: "ship_order",
      delivered: "mark_order_delivered",
      cancelled: "cancel_order",
    };

    const functionName = functions[status];

    if (!functionName) {
      throw new Error(`Unsupported order status: ${status}`);
    }

    const params = {
      p_order_id: id,
      ...(status === "cancelled"
        ? { p_reason: adminNote }
        : { p_admin_note: adminNote }),
    };

    const { data, error } = await supabase.rpc(
      functionName,
      params
    );

    if (error) throw error;
    return data;
  },
};

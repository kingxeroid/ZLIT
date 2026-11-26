
import { supabase } from "./supabase";

async function getEdgeFunctionError(error) {
  const context = error?.context;

  if (context && typeof context.clone === "function") {
    try {
      const response = context.clone();
      const body = await response.json();

      return (
        body?.error ||
        body?.message ||
        `Edge Function failed (${response.status})`
      );
    } catch {
      return `Edge Function failed (${context.status || "unknown status"})`;
    }
  }

  return error?.message || "Unknown Edge Function error.";
}

export const orderService = {
  /**
   * Creates a checkout session without creating an order.
   * Returns the session UUID from create_zlit_checkout_session.
   */
  async createCheckoutSession({ customer, note, deliveryFee = 0 }) {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
    } = customer;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      throw new Error("Please log in before checking out.");
    }

    const { data: sessionId, error } = await supabase.rpc(
      "create_zlit_checkout_session",
      {
        p_customer_name: fullName.trim(),
        p_customer_email: email?.trim() || null,
        p_customer_phone: phone.trim(),
        p_shipping_address: {
          address_line1: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: "Nigeria",
        },
        p_customer_note: note?.trim() || null,
        p_delivery_fee: deliveryFee,
      }
    );

    if (error) throw error;

    if (!sessionId) {
      throw new Error("Checkout session could not be created.");
    }

    return { id: sessionId };
  },

  /**
   * Initializes Paystack using a checkout session ID.
   */
  async initializePayment(sessionId) {
    if (!sessionId) {
      throw new Error("A checkout session ID is required.");
    }

    const { data, error } = await supabase.functions.invoke(
      "initialize-payment",
      {
        body: { sessionId },
      }
    );

    if (error) {
      const message = await getEdgeFunctionError(error);
      console.error("INITIALIZE PAYMENT ERROR:", error);
      throw new Error(message);
    }

    if (!data?.success || !data?.authorization_url) {
      throw new Error(
        data?.error || "Paystack did not return a payment URL."
      );
    }

    return data;
  },

  /**
   * Verifies a Paystack transaction.
   */
  async verifyPayment(reference) {
    const { data, error } = await supabase.functions.invoke(
      "verify-payment",
      {
        body: { reference },
      }
    );

    if (error) {
      const message = await getEdgeFunctionError(error);
      console.error("VERIFY PAYMENT ERROR:", error);
      throw new Error(message);
    }

    return data;
  },

  /**
   * Gets the customer's orders.
   */
  async getMyOrders(userId) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  /**
   * Gets one customer's order.
   */
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

  /**
   * Gets all orders for admin.
   */
  async listAll() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  /**
   * Preserves your original admin order status RPCs.
   */
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

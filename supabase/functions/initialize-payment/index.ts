
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");
    const callbackUrl = Deno.env.get("PAYSTACK_CALLBACK_URL");

    if (!paystackSecret || !callbackUrl) {
      return jsonResponse(
        { error: "Payment configuration is incomplete." },
        500
      );
    }

    // Authenticate customer
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Invalid authentication." }, 401);
    }

    const { orderId } = await req.json();

    if (!orderId || typeof orderId !== "string") {
      return jsonResponse({ error: "A valid order ID is required." }, 400);
    }

    // Admin client is used only on the server
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        customer_name,
        customer_email,
        total_amount,
        payment_status,
        status
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    if (order.user_id !== user.id) {
      return jsonResponse({ error: "You cannot pay for this order." }, 403);
    }

    if (order.payment_status === "paid") {
      return jsonResponse({ error: "This order has already been paid." }, 409);
    }

    if (order.status === "cancelled") {
      return jsonResponse({ error: "This order has been cancelled." }, 409);
    }

    const amount = Math.round(Number(order.total_amount) * 100);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return jsonResponse({ error: "Invalid order amount." }, 400);
    }

    const email = order.customer_email || user.email;

    if (!email) {
      return jsonResponse(
        { error: "A customer email is required for payment." },
        400
      );
    }

    // Generate a unique reference for this payment attempt
    const reference = `ZLIT_${crypto.randomUUID().replaceAll("-", "")}`;

    // Save the reference before initializing payment
    const { error: updateError } = await admin
      .from("orders")
      .update({
        payment_reference: reference,
        payment_status: "pending",
        payment_method: "paystack",
      })
      .eq("id", order.id)
      .eq("payment_status", "unpaid");

    if (updateError) {
      console.error("Order update failed:", updateError);
      return jsonResponse(
        { error: "Could not prepare this order for payment." },
        500
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          reference,
          callback_url: callbackUrl,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
          },
        }),
      }
    );

    const result = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status) {
      console.error("Paystack initialization failed:", result);

      await admin
        .from("orders")
        .update({
          payment_reference: null,
          payment_status: "unpaid",
          payment_method: null,
        })
        .eq("id", order.id)
        .eq("payment_reference", reference);

      return jsonResponse(
        { error: result.message || "Unable to initialize payment." },
        502
      );
    }

    return jsonResponse({
      success: true,
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
      order_id: order.id,
    });
  } catch (error) {
    console.error("Initialize payment error:", error);

    return jsonResponse(
      { error: "An unexpected payment error occurred." },
      500
    );
  }
});

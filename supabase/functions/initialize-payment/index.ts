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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    if (!paystackSecret) {
      throw new Error("Paystack secret key is not configured");
    }

    // Authenticate the customer.
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const token = authorization.replace("Bearer ", "");

    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authorization },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    const { order_id } = await req.json();

    if (!order_id || typeof order_id !== "string") {
      return jsonResponse({ error: "Valid order ID is required" }, 400);
    }

    // Privileged client is used only inside this Edge Function.
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id, order_number, user_id, customer_email, total_amount, status, payment_status, payment_reference, payment_expires_at, inventory_deducted"
      )
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: "Order not found" }, 404);
    }

    // A customer can only pay for their own order.
    if (order.user_id !== user.id) {
      return jsonResponse({ error: "You cannot pay for this order" }, 403);
    }

    if (order.status !== "pending") {
      return jsonResponse({ error: "This order cannot be paid for" }, 400);
    }

    if (order.payment_status === "paid") {
      return jsonResponse({ error: "This order has already been paid" }, 409);
    }

    if (order.payment_status === "failed") {
      return jsonResponse({ error: "This payment has expired or failed" }, 400);
    }

    if (!order.inventory_deducted) {
      return jsonResponse({ error: "The stock reservation is no longer active" }, 409);
    }

    if (
      order.payment_expires_at &&
      new Date(order.payment_expires_at).getTime() <= Date.now()
    ) {
      return jsonResponse({ error: "Your payment reservation has expired" }, 400);
    }

    const email = order.customer_email || user.email;

    if (!email) {
      return jsonResponse({ error: "Customer email is required" }, 400);
    }

    const amountKobo = Math.round(Number(order.total_amount) * 100);

    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      return jsonResponse({ error: "Invalid order amount" }, 400);
    }

    // Reuse a pending reference to avoid creating multiple transactions.
    const reference =
      order.payment_status === "pending" && order.payment_reference
        ? order.payment_reference
        : `ZLIT_${crypto.randomUUID().replaceAll("-", "")}`;

    const callbackUrl = Deno.env.get("PAYSTACK_CALLBACK_URL");

    if (!callbackUrl) {
      throw new Error("PAYSTACK_CALLBACK_URL is not configured");
    }

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
          amount: amountKobo,
          currency: "NGN",
          reference,
          callback_url: callbackUrl,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            customer_id: user.id,
          },
        }),
      },
    );

    const paystackResult = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackResult.status) {
      console.error("Paystack initialization failed:", paystackResult);
      return jsonResponse(
        { error: "Unable to initialize payment. Please try again." },
        502,
      );
    }

    // Save the reference only after Paystack accepts the transaction.
    const { error: updateError } = await admin
      .from("orders")
      .update({
        payment_reference: reference,
        payment_method: "paystack",
        payment_status: "pending",
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .neq("payment_status", "paid");

    if (updateError) {
      console.error("Order payment update failed:", updateError);
      return jsonResponse(
        { error: "Payment was initialized but the order could not be updated. Contact support." },
        500,
      );
    }

    return jsonResponse({
      success: true,
      authorization_url: paystackResult.data.authorization_url,
      access_code: paystackResult.data.access_code,
      reference,
      order_id: order.id,
    });
  } catch (error) {
    console.error("Initialize payment error:", error);

    return jsonResponse(
      { error: error instanceof Error ? error.message : "Internal server error" },
      500,
    );
  }
});


-- =========================================================
-- ZLIT: CHECKOUT AND ORDER MANAGEMENT
-- =========================================================

-- Remove old versions of these exact function signatures.
DROP FUNCTION IF EXISTS public.place_zlit_order(
  text, text, text, jsonb, numeric, text, jsonb
);

DROP FUNCTION IF EXISTS public.update_zlit_order_status(
  uuid, text, text
);


-- =========================================================
-- 1. PLACE ORDER
-- =========================================================

CREATE OR REPLACE FUNCTION public.place_zlit_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_delivery_fee numeric,
  p_customer_note text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;

  v_product public.products%ROWTYPE;
  v_variant public.product_variants%ROWTYPE;

  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;

  v_unit_price numeric;
  v_line_subtotal numeric;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_total numeric;

  v_previous_stock integer;
  v_new_stock integer;
BEGIN
  -- Validate customer information.
  IF NULLIF(TRIM(p_customer_name), '') IS NULL THEN
    RAISE EXCEPTION 'Customer name is required.';
  END IF;

  IF NULLIF(TRIM(p_customer_phone), '') IS NULL THEN
    RAISE EXCEPTION 'Customer phone number is required.';
  END IF;

  IF p_shipping_address IS NULL
     OR jsonb_typeof(p_shipping_address) <> 'object' THEN
    RAISE EXCEPTION 'A valid shipping address is required.';
  END IF;

  IF p_items IS NULL
     OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Too many different items in one order.';
  END IF;

  v_delivery_fee := COALESCE(p_delivery_fee, 0);

  IF v_delivery_fee < 0 THEN
    RAISE EXCEPTION 'Invalid delivery fee.';
  END IF;

  -- Create the order.
  INSERT INTO public.orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    subtotal,
    discount_amount,
    delivery_fee,
    total_amount,
    customer_note,
    status,
    payment_status,
    inventory_deducted
  )
  VALUES (
    auth.uid(),
    TRIM(p_customer_name),
    NULLIF(TRIM(p_customer_email), ''),
    TRIM(p_customer_phone),
    p_shipping_address,
    0,
    0,
    v_delivery_fee,
    0,
    p_customer_note,
    'pending',
    'unpaid',
    true
  )
  RETURNING id, order_number
  INTO v_order_id, v_order_number;

  -- Process each cart item.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := NULLIF(v_item ->> 'product_id', '')::uuid;
    v_variant_id := NULLIF(v_item ->> 'variant_id', '')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Invalid product in your cart.';
    END IF;

    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 100 THEN
      RAISE EXCEPTION 'Invalid quantity for a cart item.';
    END IF;

    -- Lock the product row to prevent concurrent stock changes.
    SELECT *
    INTO v_product
    FROM public.products
    WHERE id = v_product_id
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is unavailable.';
    END IF;

    -- Variant-based product.
    IF v_variant_id IS NOT NULL THEN

      SELECT *
      INTO v_variant
      FROM public.product_variants
      WHERE id = v_variant_id
        AND product_id = v_product_id
        AND is_active = true
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'A selected product variant is unavailable.';
      END IF;

      v_previous_stock := v_variant.stock_quantity;

      IF v_previous_stock < v_quantity THEN
        RAISE EXCEPTION
          'Insufficient stock for %. Available: %.',
          v_product.name,
          v_previous_stock;
      END IF;

      v_new_stock := v_previous_stock - v_quantity;

      UPDATE public.product_variants
      SET stock_quantity = v_new_stock,
          updated_at = now()
      WHERE id = v_variant_id;

      v_unit_price := COALESCE(
        v_variant.price,
        v_product.price
      );

    -- Product without a selected variant.
    ELSE

      v_previous_stock := v_product.stock_quantity;

      IF v_previous_stock < v_quantity THEN
        RAISE EXCEPTION
          'Insufficient stock for %. Available: %.',
          v_product.name,
          v_previous_stock;
      END IF;

      v_new_stock := v_previous_stock - v_quantity;

      UPDATE public.products
      SET stock_quantity = v_new_stock,
          is_sold_out = (v_new_stock = 0),
          updated_at = now()
      WHERE id = v_product_id;

      v_unit_price := v_product.price;

    END IF;

    IF v_unit_price IS NULL OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Invalid price for product %.', v_product.name;
    END IF;

    v_line_subtotal := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_subtotal;

    -- Save the order item.
    INSERT INTO public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      product_slug,
      product_image,
      size,
      color,
      sku,
      unit_price,
      quantity,
      subtotal
    )
    VALUES (
      v_order_id,
      v_product.id,
      v_variant_id,
      v_product.name,
      v_product.slug,
      COALESCE(
        v_variant.image_url,
        v_product.image_url,
        v_product.images ->> 0
      ),
      CASE
        WHEN v_variant_id IS NOT NULL THEN v_variant.size
        ELSE NULL
      END,
      CASE
        WHEN v_variant_id IS NOT NULL THEN v_variant.color
        ELSE NULL
      END,
      CASE
        WHEN v_variant_id IS NOT NULL THEN v_variant.sku
        ELSE v_product.sku
      END,
      v_unit_price,
      v_quantity,
      v_line_subtotal
    );

    -- Record stock movement.
    INSERT INTO public.inventory_movements (
      product_id,
      variant_id,
      movement_type,
      quantity,
      previous_quantity,
      new_quantity,
      reference_type,
      reference_id,
      note,
      created_by
    )
    VALUES (
      v_product_id,
      v_variant_id,
      'sale',
      -v_quantity,
      v_previous_stock,
      v_new_stock,
      'order',
      v_order_id,
      'Stock deducted for order ' || v_order_number,
      auth.uid()
    );

  END LOOP;

  -- Calculate final order total.
  v_total := v_subtotal + v_delivery_fee;

  UPDATE public.orders
  SET subtotal = v_subtotal,
      total_amount = v_total,
      updated_at = now()
  WHERE id = v_order_id;

  -- Return the order details to the frontend.
  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total_amount', v_total,
    'status', 'pending',
    'payment_status', 'unpaid'
  );
END;
$$;


-- =========================================================
-- 2. UPDATE ORDER STATUS (ADMIN ONLY)
-- =========================================================

CREATE OR REPLACE FUNCTION public.update_zlit_order_status(
  p_order_id uuid,
  p_status text,
  p_admin_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item public.order_items%ROWTYPE;

  v_previous_stock integer;
  v_new_stock integer;
BEGIN
  -- Verify admin access.
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'You are not authorized to update orders.';
  END IF;

  IF p_status NOT IN (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ) THEN
    RAISE EXCEPTION 'Invalid order status.';
  END IF;

  SELECT *
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_order.status = 'cancelled'
     AND p_status <> 'cancelled' THEN
    RAISE EXCEPTION 'A cancelled order cannot be reopened.';
  END IF;

  -- Restore stock if an order is cancelled.
  IF p_status = 'cancelled'
     AND v_order.inventory_deducted = true THEN

    FOR v_item IN
      SELECT *
      FROM public.order_items
      WHERE order_id = p_order_id
    LOOP

      IF v_item.variant_id IS NOT NULL THEN

        UPDATE public.product_variants
        SET stock_quantity = stock_quantity + v_item.quantity,
            updated_at = now()
        WHERE id = v_item.variant_id
        RETURNING stock_quantity - v_item.quantity,
                  stock_quantity
        INTO v_previous_stock, v_new_stock;

        IF FOUND THEN
          INSERT INTO public.inventory_movements (
            product_id,
            variant_id,
            movement_type,
            quantity,
            previous_quantity,
            new_quantity,
            reference_type,
            reference_id,
            note,
            created_by
          )
          VALUES (
            v_item.product_id,
            v_item.variant_id,
            'return',
            v_item.quantity,
            v_previous_stock,
            v_new_stock,
            'order',
            p_order_id,
            'Stock restored after order cancellation',
            auth.uid()
          );
        END IF;

      ELSE

        UPDATE public.products
        SET stock_quantity = stock_quantity + v_item.quantity,
            is_sold_out = false,
            updated_at = now()
        WHERE id = v_item.product_id
        RETURNING stock_quantity - v_item.quantity,
                  stock_quantity
        INTO v_previous_stock, v_new_stock;

        IF FOUND THEN
          INSERT INTO public.inventory_movements (
            product_id,
            movement_type,
            quantity,
            previous_quantity,
            new_quantity,
            reference_type,
            reference_id,
            note,
            created_by
          )
          VALUES (
            v_item.product_id,
            'return',
            v_item.quantity,
            v_previous_stock,
            v_new_stock,
            'order',
            p_order_id,
            'Stock restored after order cancellation',
            auth.uid()
          );
        END IF;

      END IF;

    END LOOP;

  END IF;

  UPDATE public.orders
  SET status = p_status,
      admin_note = COALESCE(p_admin_note, admin_note),
      inventory_deducted = CASE
        WHEN p_status = 'cancelled' THEN false
        ELSE inventory_deducted
      END,
      confirmed_at = CASE
        WHEN p_status = 'confirmed'
          THEN COALESCE(confirmed_at, now())
        ELSE confirmed_at
      END,
      shipped_at = CASE
        WHEN p_status = 'shipped'
          THEN COALESCE(shipped_at, now())
        ELSE shipped_at
      END,
      delivered_at = CASE
        WHEN p_status = 'delivered'
          THEN COALESCE(delivered_at, now())
        ELSE delivered_at
      END,
      cancelled_at = CASE
        WHEN p_status = 'cancelled'
          THEN COALESCE(cancelled_at, now())
        ELSE cancelled_at
      END,
      updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', p_status
  );
END;
$$;


-- =========================================================
-- 3. FUNCTION PERMISSIONS
-- =========================================================

REVOKE ALL ON FUNCTION public.place_zlit_order(
  text, text, text, jsonb, numeric, text, jsonb
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.place_zlit_order(
  text, text, text, jsonb, numeric, text, jsonb
) TO anon, authenticated;


REVOKE ALL ON FUNCTION public.update_zlit_order_status(
  uuid, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.update_zlit_order_status(
  uuid, text, text
) TO authenticated;


-- Refresh Supabase API schema cache.
NOTIFY pgrst, 'reload schema';

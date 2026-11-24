
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import { useAuth } from "./AuthContext";

export const CartContext = createContext(null);

const STORAGE_KEY = "zlit_cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function sameCartItem(a, b) {
  return (
    String(a.id) === String(b.id) &&
    String(a.variant_id || "") === String(b.variant_id || "")
  );
}

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [items, setItems] = useState(readCart);
  const [cartReady, setCartReady] = useState(false);

  // Persist local cart.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Load or migrate the authenticated user's cart.
  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      if (!user?.id) {
        setCartReady(true);
        return;
      }

      setCartReady(false);

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          products (
            id,
            name,
            slug,
            price,
            compare_at_price,
            image_url,
            images
          ),
          product_variants (
            id,
            size,
            color,
            price,
            stock_quantity
          )
        `)
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        console.error("Cart loading failed:", error.message);
        setCartReady(true);
        return;
      }

      if (data?.length) {
        const mapped = data
          .filter((row) => row.products)
          .map((row) => ({
            ...row.products,
            id: row.product_id,
            variant_id: row.variant_id,
            selectedSize: row.product_variants?.size || null,
            selectedColor: row.product_variants?.color || null,
            price: Number(
              row.product_variants?.price ?? row.products.price
            ),
            quantity: Number(row.quantity),
            cart_row_id: row.id,
          }));

        setItems(mapped);
      } else {
        const localItems = readCart();

        if (localItems.length) {
          for (const item of localItems) {
            const { error: insertError } = await supabase
              .from("cart_items")
              .insert({
                user_id: user.id,
                product_id: item.id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
              });

            if (insertError) {
              console.error("Cart migration failed:", insertError.message);
            }
          }
        }
      }

      if (active) setCartReady(true);
    };

    loadCart();

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Save a product or variant to Supabase.
  const saveRow = useCallback(
    async (product, quantity) => {
      if (!user?.id) return;

      if (product.cart_row_id) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", product.cart_row_id)
          .eq("user_id", user.id);

        if (error) throw error;
        return;
      }

      let query = supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      query = product.variant_id
        ? query.eq("variant_id", product.variant_id)
        : query.is("variant_id", null);

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (data) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", data.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            variant_id: product.variant_id || null,
            quantity,
          });

        if (insertError) throw insertError;
      }
    },
    [user?.id]
  );

  const addToCart = useCallback(
    (product) => {
      const quantity = Math.max(1, Number(product.quantity || 1));

      const existing = items.find((item) =>
        sameCartItem(item, product)
      );

      const next = existing
        ? items.map((item) =>
            sameCartItem(item, product)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...items, { ...product, quantity }];

      setItems(next);

      const updated = next.find((item) =>
        sameCartItem(item, product)
      );

      saveRow(updated, updated.quantity).catch((error) => {
        console.error("Cart save failed:", error.message);
      });
    },
    [items, saveRow]
  );

  const updateQuantity = useCallback(
    (product, quantity) => {
      const nextQty = Math.max(1, Number(quantity));

      setItems((current) =>
        current.map((item) =>
          sameCartItem(item, product)
            ? { ...item, quantity: nextQty }
            : item
        )
      );

      saveRow(product, nextQty).catch((error) => {
        console.error("Cart update failed:", error.message);
      });
    },
    [saveRow]
  );

  const removeFromCart = useCallback(
    (product) => {
      setItems((current) =>
        current.filter((item) => !sameCartItem(item, product))
      );

      if (user?.id) {
        let query = supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        query = product.variant_id
          ? query.eq("variant_id", product.variant_id)
          : query.is("variant_id", null);

        query.then(({ error }) => {
          if (error) console.error("Cart delete failed:", error.message);
        });
      }
    },
    [user?.id]
  );

  const clearCart = useCallback(async () => {
    setItems([]);

    if (user?.id) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) console.error("Cart clear failed:", error.message);
    }
  }, [user?.id]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      cartReady,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      cartReady,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

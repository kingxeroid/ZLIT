
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "../../services/supabase";

import ProductForm from "../../components/products/ProductForm";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { uploadService } from "../../services/uploadService";
import { adminService } from "../../services/adminService";

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const notificationTimer = useRef(null);
  const navigationTimer = useRef(null);

  const notify = (type, title, message) => {
    clearTimeout(notificationTimer.current);

    setNotification({ type, title, message });

    notificationTimer.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    let active = true;

    categoryService
      .list({ admin: true })
      .then((data) => {
        if (active) setCategories(data || []);
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          notify("error", "Categories failed", e.message);
        }
      });

    return () => {
      active = false;
      clearTimeout(notificationTimer.current);
      clearTimeout(navigationTimer.current);
    };
  }, []);

  const handleSubmit = async (form) => {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      // SUPPORT MULTIPLE IMAGES
      const selectedImages =
        form.images?.length > 0
          ? Array.from(form.images)
          : form.image
          ? [form.image]
          : [];

      // UPLOAD ALL IMAGES
      let imageUrls = [];

      if (selectedImages.length) {
        try {
          imageUrls = await Promise.all(
            selectedImages.map((image) =>
              uploadService.productImage(image)
            )
          );
        } catch (e) {
          throw new Error(`Image upload failed: ${e.message}`);
        }
      }

      const imageUrl = imageUrls[0] || null;

      // CREATE PRODUCT
      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const productId = await productService.create({
        name: form.name.trim(),
        slug: `${slug}-${Date.now().toString().slice(-5)}`,
        description: form.description,
        sku: form.sku || null,
        category_id: form.category || null,
        price: form.price,
        compare_at_price: form.comparePrice || null,
        image_url: imageUrl,
        images: imageUrls,
        is_active: form.status === "active",
        metadata: { status: form.status },
        variants: [
          {
            size: null,
            stock_quantity: form.stock,
            sku: form.sku || null,
            is_active: true,
          },
        ],
      });

      // ASSIGN PRODUCT TO SELECTED COLLECTIONS
if (form.collectionIds?.length > 0) {
  const assignments = form.collectionIds.map((collectionId) => ({
    product_id: productId,
    collection_id: collectionId,
  }));

  const { error: assignmentError } = await supabase
    .from("collection_products")
    .insert(assignments);

  if (assignmentError) {
    console.error("COLLECTION ASSIGNMENT ERROR:", assignmentError);

    throw new Error(
      `Product was created, but collection assignment failed: ${assignmentError.message}`
    );
  }

  console.log("PRODUCT COLLECTIONS SAVED:", assignments);
}
      
      // SUCCESS
      notify(
        "success",
        "Product created!",
        `${form.name} has been added with ${imageUrls.length} image(s).`
      );

      // ACTIVITY LOG
      try {
        await adminService.log(
          "create",
          "product",
          productId,
          `Created product ${form.name}`
        );
      } catch (logError) {
        console.error("Activity log failed:", logError);
      }

      navigationTimer.current = setTimeout(() => {
        navigate("/admin/products");
      }, 700);

    } catch (e) {
      console.error("Product creation failed:", e);

      setError(e.message || "Could not save product.");

      notify(
        "error",
        "Product creation failed",
        e.message || "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const NotificationIcon =
    notification?.type === "success"
      ? CheckCircle2
      : notification?.type === "error"
      ? XCircle
      : AlertCircle;

  return (
    <div className="space-y-6">

      {/* TOAST */}
      <div className="pointer-events-none fixed right-4 top-20 z-[300] w-[calc(100%-2rem)] max-w-sm">
        <AnimatePresence>
          {notification && (
            <motion.div
              key={notification.title + notification.message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl ${
                notification.type === "success"
                  ? "border-emerald-500/20 bg-[#19241f]"
                  : "border-red-500/20 bg-[#25191b]"
              }`}
            >
              <NotificationIcon
                size={20}
                className={`shrink-0 ${
                  notification.type === "success"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {notification.title}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-white/60">
                  {notification.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearTimeout(notificationTimer.current);
                  setNotification(null);
                }}
                className="shrink-0 text-white/40 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/products")}
          className="rounded-full bg-zlit-surface p-2.5 text-zlit-muted transition hover:text-white"
        >
          <ArrowLeft size={17} />
        </button>

        <div>
          <h1 className="font-display text-2xl font-bold">
            Add Product
          </h1>
          <p className="mt-1 text-xs text-zlit-muted">
            Add a new item to your store.
          </p>
        </div>
      </div>

      {/* ERROR DETAILS */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />

          <p className="flex-1 text-xs leading-5 text-red-300">
            {error}
          </p>

          <button
            onClick={() => setError("")}
            className="text-red-300/60 hover:text-red-300"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CATEGORY WARNING */}
      {!categories.length && (
        <p className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-300">
          Create at least one category before adding products.
        </p>
      )}

      {/* FORM */}
      <div className={saving ? "pointer-events-none opacity-70" : ""}>
        <ProductForm
          categories={categories}
          disabled={saving || !categories.length}
          submitLabel={
            saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating product...
              </span>
            ) : (
              "Create product"
            )
          }
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

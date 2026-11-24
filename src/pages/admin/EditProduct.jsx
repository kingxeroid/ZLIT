
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
} from "lucide-react";

import ProductForm from "../../components/products/ProductForm";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { uploadService } from "../../services/uploadService";
import { adminService } from "../../services/adminService";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

    Promise.all([
      productService.getById(id, { admin: true }),
      categoryService.list({ admin: true }),
    ])
      .then(([item, cats]) => {
        if (!active) return;

        setProduct(item);
        setCategories(cats || []);
      })
      .catch((e) => {
        if (!active) return;

        setError(e.message || "Unable to load product.");
        notify("error", "Loading failed", e.message || "Unable to load product.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(notificationTimer.current);
      clearTimeout(navigationTimer.current);
    };
  }, [id]);

  const handleSubmit = async (form) => {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      // Keep existing images unless the form explicitly supplies
      // a replacement list.
      const existingImages =
        form.existingImages ||
        product.images ||
        (product.image_url ? [product.image_url] : []);

      const newFiles = form.images?.length
        ? Array.from(form.images)
        : form.image
        ? [form.image]
        : [];

      // Upload new images.
      const uploadedImages = newFiles.length
        ? await uploadService.productImages(newFiles)
        : [];

      // Combine retained existing images and newly uploaded images.
      const imageUrls = [
        ...existingImages,
        ...uploadedImages,
      ];

      const imageUrl =
        imageUrls[0] ||
        form.existingImage ||
        product.image_url ||
        null;

      const slug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Update product.
      await productService.update(id, {
        name: form.name.trim(),
        slug: `${slug}-${id.slice(0, 5)}`,
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

      notify(
        "success",
        "Product updated!",
        `${form.name} has been updated successfully.`
      );

      // Activity logging should not block successful updates.
      try {
        await adminService.log(
          "update",
          "product",
          id,
          `Updated product ${form.name}`
        );
      } catch (logError) {
        console.error("Activity log failed:", logError);
      }

      navigationTimer.current = setTimeout(() => {
        navigate("/admin/products");
      }, 700);

    } catch (e) {
      console.error("Product update failed:", e);

      setError(e.message || "Could not update product.");

      notify(
        "error",
        "Update failed",
        e.message || "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-zlit-muted">
        Loading product…
      </p>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-400">
          {error || "Product not found."}
        </p>
        <button
          onClick={() => navigate("/admin/products")}
          className="mt-4 text-sm text-white underline"
        >
          Back to products
        </button>
      </div>
    );
  }

  const NotificationIcon =
    notification?.type === "success" ? CheckCircle2 : XCircle;

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
            Edit Product
          </h1>
          <p className="mt-1 text-xs text-zlit-muted">
            Update your product details.
          </p>
        </div>
      </div>

      {/* ERROR */}
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

      {/* FORM */}
      <div className={saving ? "pointer-events-none opacity-70" : ""}>
        <ProductForm
          categories={categories}
          initialData={{
            ...product,
            category: product.category_id,
            comparePrice: product.compare_at_price,
            stock: product.stock,
            image: product.image_url,
            existingImage: product.image_url,
            existingImages:
              product.images?.length
                ? product.images
                : product.image_url
                ? [product.image_url]
                : [],
            status: product.is_active ? "active" : "draft",
          }}
          disabled={saving}
          submitLabel={
            saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving changes...
              </span>
            ) : (
              "Save changes"
            )
          }
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

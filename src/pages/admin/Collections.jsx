
import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../services/supabase";
import { uploadService } from "../../services/uploadService";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  const notify = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const loadCollections = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("collections")
      .select("*");

    if (error) {
      notify(error.message, "error");
    } else {
      setCollections(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      notify("Choose a JPG, PNG or WEBP image.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      notify("Image must be 5 MB or smaller.", "error");
      event.target.value = "";
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const imagePreview = URL.createObjectURL(file);

    previewRef.current = imagePreview;
    setPreview(imagePreview);
    setForm((previous) => ({
      ...previous,
      image: file,
    }));
  };

  const uploadCollectionImage = async (file) => {
    if (!file) return null;

    const extension = file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";

    const randomId =
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const path = `collections/${randomId}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const resetForm = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }

    setPreview("");
    setForm({
      name: "",
      description: "",
      image: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!form.name.trim()) {
    notify("Enter a collection name.", "error");
    return;
  }

  if (!form.image) {
    notify("Choose a collection image.", "error");
    return;
  }

  setSaving(true);

  try {
    console.log("STEP 1: Starting image upload");

    let imageUrl;

    try {
      imageUrl = await uploadService.productImage(form.image);
      console.log("STEP 2: Image uploaded:", imageUrl);
    } catch (error) {
      console.error("UPLOAD REQUEST FAILED:", error);
      throw error;
    }

    console.log("STEP 3: Saving collection");

    const { data, error } = await supabase
      .from("collections")
      .insert({
        name: form.name.trim(),
        slug: makeSlug(form.name),
        description: form.description.trim() || null,
        image_url: imageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("DATABASE REQUEST FAILED:", error);
      throw error;
    }

    console.log("STEP 4: Collection saved:", data);

    resetForm();
    await loadCollections();

    notify("Collection created successfully.");
  } catch (error) {
    console.error("COLLECTION ERROR:", error);

    notify(
      error.message || "Something went wrong.",
      "error"
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (collection) => {
    const confirmed = window.confirm(
      `Delete "${collection.name}"?`
    );

    if (!confirmed) return;

    setDeleting(collection.id);

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id);

    if (error) {
      notify(error.message, "error");
    } else {
      setCollections((previous) =>
        previous.filter((item) => item.id !== collection.id)
      );

      notify("Collection deleted.");
    }

    setDeleting(null);
  };

  return (
    <div className="space-y-8 text-white">
      {/* Notifications */}
      <div className="fixed right-4 top-5 z-[100]">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              className={`flex items-center gap-3 rounded-full border px-5 py-3 shadow-2xl backdrop-blur-xl ${
                toast.type === "error"
                  ? "border-red-500/30 bg-red-950/95 text-red-300"
                  : "border-green-500/30 bg-green-950/95 text-green-300"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}

              <span className="text-sm font-medium">
                {toast.message}
              </span>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="ml-1 rounded-full p-1 hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Collections</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Create and manage your store collections.
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400">
            {collections.length} collections
          </span>
        </div>
      </div>

      {/* Create Collection */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#202023] p-5 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-red-600/10 p-3 text-red-500">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="font-semibold">Create Collection</h2>
            <p className="text-xs text-zinc-500">
              Add a new collection to your store.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Collection Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Summer Collection"
                className="w-full rounded-full border border-white/10 bg-[#171719] px-5 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-red-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe this collection..."
                className="w-full rounded-2xl border border-white/10 bg-[#171719] px-5 py-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-red-500"    />
            </div>
          </div>

          {/* Image Picker */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Collection Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-[#171719]">
                <img
                  src={preview}
                  alt="Collection preview"
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="absolute right-3 top-3 rounded-full bg-black/80 p-2 text-white hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <X size={17} />
                </button>

                <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-4 py-2 text-xs text-white">
                  Image selected
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#171719] transition hover:border-red-500/60 hover:bg-white/[0.02]"
              >
                <div className="mb-3 rounded-full bg-white/5 p-4 text-zinc-400">
                  <ImagePlus size={25} />
                </div>

                <span className="text-sm font-medium">
                  Choose an image
                </span>

                <span className="mt-2 text-xs text-zinc-500">
                  JPG, PNG or WEBP · Maximum 5MB
                </span>
              </button>
            )}

            {preview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-400 transition hover:border-red-500 hover:text-white"
              >
                <Upload size={14} />
                Change image
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={17} />
                Create Collection
              </>
            )}
          </button>
        </div>
      </form>

      {/* Collection List */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Collections</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="animate-spin text-red-500" size={28} />
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <ImagePlus className="mx-auto mb-3 text-zinc-600" size={32} />
            <p className="text-sm text-zinc-400">
              No collections created yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                layout
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#202023]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#171719]">
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      <ImagePlus size={35} />
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white">
                    {collection.is_active ? "Active" : "Inactive"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(collection)}
                    disabled={deleting === collection.id}
                    className="absolute right-3 top-3 rounded-full bg-black/75 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
                    aria-label={`Delete ${collection.name}`}
                  >
                    {deleting === collection.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold">
                    {collection.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {collection.description || "No description provided."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

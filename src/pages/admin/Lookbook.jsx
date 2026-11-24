
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";

import { supabase } from "../../services/supabase";

const BUCKET = "product-images";

export default function Lookbook() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("lookbook")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setRows(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  // Clean up image preview URLs
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setError("");
    setSuccess("");

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Only JPG, PNG and WEBP images are supported.");
      e.target.value = "";
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must not exceed 5MB.");
      e.target.value = "";
      return;
    }

    setFile(selected);
  };

  const resetForm = () => {
    setForm({ title: "", description: "" });
    setFile(null);

    const input = document.getElementById("lookbook-image");
    if (input) input.value = "";
  };

  const add = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    let uploadedPath = null;

    try {
      const extension = file.name.split(".").pop().toLowerCase();

      const filePath = `lookbook/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedPath = filePath;

      // Generate public image URL
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      const imageUrl = publicData.publicUrl;

      // Save image URL and details in database
      const { error: insertError } = await supabase
        .from("lookbook")
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          image_url: imageUrl,
          is_active: true,
          sort_order: rows.length,
        });

      if (insertError) throw insertError;

      resetForm();
      setSuccess("Lookbook image published successfully.");
      await load();

    } catch (err) {
      // Remove uploaded file if database insertion fails
      if (uploadedPath) {
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);
      }

      setError(err.message || "Unable to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (row) => {
    const confirmed = window.confirm(
      `Delete "${row.title}" from the Lookbook?`
    );

    if (!confirmed) return;

    setDeleting(row.id);
    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase
        .from("lookbook")
        .delete()
        .eq("id", row.id);

      if (deleteError) throw deleteError;

      // Remove the image from Storage as well
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const imagePath = row.image_url?.split(marker)[1];

      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove([decodeURIComponent(imagePath)]);

        if (storageError) {
          console.error("Storage cleanup failed:", storageError.message);
        }
      }

      setSuccess("Lookbook image deleted.");
      await load();

    } catch (err) {
      setError(err.message || "Unable to delete image.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zlit-red">
          Storefront management
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold">
          Lookbook
        </h1>

        <p className="mt-2 text-sm text-zlit-muted">
          Publish visual stories and outfit inspiration.
        </p>
      </div>

      {/* UPLOAD FORM */}
      <form
        onSubmit={add}
        className="max-w-2xl space-y-5 rounded-2xl border border-white/5 bg-zlit-surface p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zlit-red/10 text-zlit-red">
            <ImagePlus size={21} />
          </div>

          <div>
            <h2 className="font-display font-bold">
              Add lookbook image
            </h2>
            <p className="text-xs text-zlit-muted">
              Upload a fashion photo from your device.
            </p>
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label
            htmlFor="lookbook-image"
            className="group relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-zlit-bg transition hover:border-zlit-red/70"
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Lookbook preview"
                  className="absolute inset-0 h-full w-full object-contain"
                />

                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white">
                  Change image
                </span>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zlit-surface text-zlit-red">
                  <Upload size={24} />
                </div>

                <p className="text-sm font-semibold">
                  Tap to select an image
                </p>

                <p className="mt-2 text-xs text-zlit-muted">
                  JPG, PNG or WEBP · Maximum 5MB
                </p>
              </>
            )}
          </label>

          <input
            id="lookbook-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {file && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-zlit-bg p-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">
                  {file.name}
                </p>
                <p className="mt-1 text-[10px] text-zlit-muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  const input = document.getElementById("lookbook-image");
                  if (input) input.value = "";
                }}
                className="rounded-full p-2 text-zlit-muted hover:bg-white/10 hover:text-white"
                aria-label="Remove selected image"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>

        {/* TITLE */}
        <div>
          <label className="mb-2 block text-xs font-semibold">
            Lookbook title
          </label>

          <input
            required
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="e.g. Urban Essentials"
            className="zl-input"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-2 block text-xs font-semibold">
            Description
          </label>

          <textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Tell customers about this outfit or collection..."
            className="w-full resize-none rounded-2xl border border-white/10 bg-zlit-bg p-4 text-sm outline-none transition focus:border-zlit-red"
          />
        </div>

        {/* MESSAGES */}
        {error && (
          <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-xl bg-green-500/10 p-3 text-xs text-green-300">
            {success}
          </p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading || !file}
          className="zl-primary inline-flex min-h-11 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus size={16} />
              Publish lookbook
            </>
          )}
        </button>
      </form>

      {/* PUBLISHED IMAGES */}
      <section className="space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">
              Published stories
            </h2>
            <p className="mt-1 text-xs text-zlit-muted">
              {rows.length} published images
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-zlit-surface px-5 py-16 text-center">
            <ImagePlus
              size={32}
              className="mx-auto text-zlit-muted"
            />

            <p className="mt-4 text-sm font-semibold">
              No lookbook images yet
            </p>

            <p className="mt-2 text-xs text-zlit-muted">
              Upload your first fashion story above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((row) => (
              <article
                key={row.id}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-zlit-surface"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-zlit-bg">
                  <img
                    src={row.image_url}
                    alt={row.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <button
                    type="button"
                    disabled={deleting === row.id}
                    onClick={() => remove(row)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                    aria-label={`Delete ${row.title}`}
                  >
                    {deleting === row.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-semibold">
                    {row.title}
                  </p>

                  {row.description && (
                    <p className="mt-1 line-clamp-2 text-[10px] text-zlit-muted">
                      {row.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

      </section>
    </div>
  );
}


import { useEffect, useState } from "react";
import { ImagePlus, X, Star } from "lucide-react";

export default function ProductForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save product",
  categories = [],
  disabled = false,
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    sku: initialData.sku || "",
    category: initialData.category || initialData.category_id || "",
    price: initialData.price || "",
    comparePrice: initialData.comparePrice || "",
    stock: initialData.stock ?? "",
    description: initialData.description || "",
    status: initialData.status || "active",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(
    initialData.existingImages ||
    initialData.images ||
    (initialData.image ? [initialData.image] : [])
  );

  const [previews, setPreviews] = useState([]);

  // Create and clean up local image previews.
  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const update = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const addImages = (event) => {
    const selected = Array.from(event.target.files || []);

    if (!selected.length) return;

    setImages((current) => [...current, ...selected]);

    // Allow selecting the same file again later.
    event.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (index) => {
    setImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
      price: Number(form.price),
      comparePrice: Number(form.comparePrice || 0),
      stock: Number(form.stock),
      images,
      existingImages,
      image: images[0] || null,
      existingImage: existingImages[0] || "",
    });
  };

  const inputClass =
    "w-full rounded-pill border border-white/10 bg-[#1B1B1E] px-4 py-3 text-xs text-white outline-none transition focus:border-zlit-red";

  const labelClass =
    "mb-2 block text-[11px] font-medium text-zlit-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">

        {/* LEFT */}
        <div className="space-y-5">
          <section className="rounded-card border border-white/[0.06] bg-zlit-surface p-5">
            <h2 className="mb-5 text-sm font-semibold">
              Basic information
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Product name</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="e.g. Oversized Graphic Tee"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SKU</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={update}
                  placeholder="ZL-TEE-001"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={update}
                  rows={5}
                  placeholder="Describe the product..."
                  className="w-full resize-y rounded-2xl border border-white/10 bg-[#1B1B1E] px-4 py-3 text-xs outline-none focus:border-zlit-red"
                />
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section className="rounded-card border border-white/[0.06] bg-zlit-surface p-5">
            <h2 className="mb-5 text-sm font-semibold">
              Pricing and inventory
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Price (₦)</label>
                <input
                  required
                  min="0"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={update}
                  placeholder="25000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Compare-at price (₦)
                </label>
                <input
                  min="0"
                  type="number"
                  name="comparePrice"
                  value={form.comparePrice}
                  onChange={update}
                  placeholder="30000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Stock quantity</label>
                <input
                  required
                  min="0"
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={update}
                  placeholder="20"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={update}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* MULTIPLE IMAGES */}
          <section className="rounded-card border border-white/[0.06] bg-zlit-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Product images
                </h2>
                <p className="mt-1 text-[10px] text-zlit-muted">
                  Upload multiple product angles.
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] text-zlit-muted">
                {existingImages.length + images.length} images
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* EXISTING IMAGES */}
              {existingImages.map((src, index) => (
                <div
                  key={`existing-${src}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-[#1B1B1E]"
                >
                  <img
                    src={src}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-contain"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-zlit-red px-2 py-1 text-[9px] font-semibold text-white">
                      <Star size={10} />
                      Cover
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeExistingImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/75 p-2 text-white transition hover:bg-red-600"
                    aria-label="Remove existing image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              {/* NEW IMAGE PREVIEWS */}
              {previews.map((src, index) => {
                const isCover =
                  existingImages.length === 0 && index === 0;

                return (
                  <div
                    key={`new-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-[#1B1B1E]"
                  >
                    <img
                      src={src}
                      alt={`New product image ${index + 1}`}
                      className="h-full w-full object-contain"
                    />

                    {isCover && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-zlit-red px-2 py-1 text-[9px] font-semibold text-white">
                        <Star size={10} />
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/75 p-2 text-white transition hover:bg-red-600"
                      aria-label="Remove new image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}

              {/* UPLOAD BUTTON */}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#1B1B1E] transition hover:border-zlit-red">
                <ImagePlus size={25} className="mb-2 text-zlit-muted" />
                <span className="text-xs font-medium">
                  Add images
                </span>
                <span className="mt-1 text-center text-[9px] text-zlit-muted">
                  Select multiple files
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  disabled={disabled}
                  className="hidden"
                  onChange={addImages}
                />
              </label>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-zlit-muted">
              JPG, PNG or WEBP. Maximum 5 MB per image. The first image
              is used as the product cover.
            </p>
          </section>

          {/* STATUS */}
          <section className="rounded-card border border-white/[0.06] bg-zlit-surface p-5">
            <h2 className="mb-4 text-sm font-semibold">
              Product status
            </h2>

            <select
              name="status"
              value={form.status}
              onChange={update}
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </section>

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-pill bg-zlit-red px-5 py-3 text-xs font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

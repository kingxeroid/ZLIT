import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";

const emptyCollection = {
  name: "",
  slug: "",
  description: "",
  status: "active",
  featured: false,
};

export default function CollectionForm({
  initialData,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(initialData || emptyCollection);

  useEffect(() => {
    setForm(initialData || emptyCollection);
  }, [initialData]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleName = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-card bg-zlit-surface p-5 sm:p-7"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">
            {initialData ? "Edit collection" : "New collection"}
          </h2>
          <p className="mt-1 text-xs text-zlit-muted">
            Group products into a curated collection.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/5 p-2 text-zlit-muted hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Collection name"
          value={form.name}
          onChange={(e) => handleName(e.target.value)}
          placeholder="e.g. Winter Essentials"
          required
        />

        <Input
          label="URL slug"
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          placeholder="winter-essentials"
          required
        />

        <div>
          <label className="mb-2 block text-xs font-semibold text-zlit-muted">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe this collection..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-zlit-bg px-4 py-3 text-sm outline-none focus:border-zlit-red"
          />
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-zlit-bg p-4">
          <div>
            <p className="text-sm font-semibold">Featured collection</p>
            <p className="mt-1 text-xs text-zlit-muted">
              Highlight this collection on the storefront.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 accent-zlit-red"
          />
        </label>

        <div>
          <label className="mb-2 block text-xs font-semibold text-zlit-muted">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="zl-input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-2 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Save changes" : "Create collection"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
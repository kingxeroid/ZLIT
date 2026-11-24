import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  const image =
    item.image_url ||
    item.image ||
    "https://placehold.co/300x350/242427/F4F4F4?text=ZLIT";

  return (
    <div className="flex gap-4 border-b border-white/5 py-5">
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-zlit-surface">
        <img
          src={image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{item.name}</h3>
            {item.selectedSize && (
              <p className="mt-1 text-xs text-zlit-muted">
                Size: {item.selectedSize}
              </p>
            )}
            <p className="mt-2 text-sm font-bold">
              ₦{Number(item.price).toLocaleString("en-NG")}
            </p>
          </div>

          <button
            onClick={() => onRemove?.(item)}
            className="text-zlit-muted transition hover:text-zlit-red"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 rounded-full bg-zlit-surface px-3 py-2">
            <button
              onClick={() =>
                onUpdateQuantity?.(item, Math.max(1, item.quantity - 1))
              }
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>

            <span className="text-xs">{item.quantity}</span>

            <button
              onClick={() =>
                onUpdateQuantity?.(item, item.quantity + 1)
              }
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>

          <span className="text-xs font-semibold">
            ₦{(Number(item.price) * item.quantity).toLocaleString("en-NG")}
          </span>
        </div>
      </div>
    </div>
  );
}
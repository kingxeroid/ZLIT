import { ImageOff } from "lucide-react";

export default function ProductImagePreview({
  src,
  alt = "Product image",
  className = "",
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-[#303034] text-zlit-muted ${className}`}
      >
        <ImageOff size={24} />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl bg-[#303034] ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
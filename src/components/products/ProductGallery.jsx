
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const FALLBACK_IMAGE =
  "https://placehold.co/700x850/242427/F4F4F4?text=ZLIT";

export default function ProductGallery({
  images = [],
  productName = "Product",
}) {
  const gallery = images?.length
    ? images.filter(Boolean)
    : [FALLBACK_IMAGE];

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setActive(0);
    setZoom(false);
  }, [productName, images]);

  const changeImage = (direction) => {
    setActive((current) =>
      (current + direction + gallery.length) % gallery.length
    );
  };

  useEffect(() => {
    if (!zoom) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setZoom(false);
      if (event.key === "ArrowLeft") changeImage(-1);
      if (event.key === "ArrowRight") changeImage(1);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoom, gallery.length]);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="group relative aspect-[4/5] overflow-hidden rounded-card bg-zlit-surface">
          <img
            src={gallery[active]}
            alt={`${productName} view ${active + 1}`}
            onClick={() => setZoom(true)}
            className="h-full w-full cursor-zoom-in object-cover"
            loading="eager"
            draggable={false}
          />

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeImage(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-zlit-red"
                aria-label="Previous image"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={() => changeImage(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-zlit-red"
                aria-label="Next image"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}

          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {active + 1} / {gallery.length}
          </span>
        </div>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={active === index}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  active === index
                    ? "border-zlit-red"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          >
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute right-5 top-5 z-10 rounded-full bg-white/10 p-3 text-white"
              aria-label="Close image"
            >
              <X size={20} />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    changeImage(-1);
                  }}
                  className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    changeImage(1);
                  }}
                  className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <img
              src={gallery[active]}
              alt={`${productName} enlarged`}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] max-w-full rounded-2xl object-contain"
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

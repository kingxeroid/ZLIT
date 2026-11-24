
import { supabase } from "./supabase";

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadService = {
  async productImage(file) {
    if (!file) return null;

    if (!ALLOWED_TYPES[file.type]) {
      throw new Error("Choose a JPG, PNG or WEBP image.");
    }

    if (file.size > MAX_SIZE) {
      throw new Error("Image must be 5 MB or smaller.");
    }

    const extension = ALLOWED_TYPES[file.type];

    const path = `products/${crypto.randomUUID()}.${extension}`;

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
  },

  async productImages(files) {
    if (!files?.length) return [];

    const selectedFiles = Array.from(files);

    // Validate every file before starting uploads.
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES[file.type]) {
        throw new Error(
          `${file.name}: Choose a JPG, PNG or WEBP image.`
        );
      }

      if (file.size > MAX_SIZE) {
        throw new Error(
          `${file.name}: Image must be 5 MB or smaller.`
        );
      }
    }

    const uploadedPaths = [];

    try {
      const urls = await Promise.all(
        selectedFiles.map(async (file) => {
          const extension = ALLOWED_TYPES[file.type];
          const path = `products/${crypto.randomUUID()}.${extension}`;

          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

          if (error) throw error;

          uploadedPaths.push(path);

          const { data } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);

          return data.publicUrl;
        })
      );

      return urls;
    } catch (error) {
      // Remove successfully uploaded files if another upload fails.
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError);
        }
      }

      throw error;
    }
  },
};

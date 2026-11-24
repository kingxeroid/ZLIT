import { useCallback, useEffect, useState } from "react";
import { productService } from "../services/productService";

export default function useProducts(options = {}) {
  const admin = Boolean(options.admin);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await productService.list({ admin }));
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => { refresh(); }, [refresh]);
  return { products, setProducts, loading, error, refresh };
}

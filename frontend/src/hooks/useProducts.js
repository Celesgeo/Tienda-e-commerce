import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch {
        toast.error("No se pudo cargar la tienda");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { products, categories, loading };
};

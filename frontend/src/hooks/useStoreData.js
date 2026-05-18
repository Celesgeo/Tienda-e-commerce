import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export const useStoreData = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const response = await api.get("/store");
      setStore(response.data.data || null);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const on = () => {
      refetch();
    };
    window.addEventListener("tienda-store-updated", on);
    return () => window.removeEventListener("tienda-store-updated", on);
  }, [refetch]);

  return { store, loading, refetchStore: refetch };
};

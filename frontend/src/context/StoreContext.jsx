/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "../hooks/useLocalStorage";

const StoreContext = createContext(null);

export const cartLineKey = (item) =>
  `${item._id}__${item.selectedColor ?? ""}__${item.selectedSize ?? ""}`;

export const StoreProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage("ecommerce_cart", []);
  const [wishlist, setWishlist] = useLocalStorage("ecommerce_wishlist", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(99999999);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product, opts = {}) => {
    const selectedColor = opts.color ?? "";
    const selectedSize = opts.size ?? "";
    const line = { ...product, selectedColor, selectedSize };
    setCart((prev) => {
      const existing = prev.find((p) => cartLineKey(p) === cartLineKey(line));
      if (existing) {
        toast.success("Cantidad actualizada");
        return prev.map((p) =>
          cartLineKey(p) === cartLineKey(line) ? { ...p, qty: p.qty + (opts.qtyDelta ?? 1) } : p
        );
      }
      toast.success("Producto agregado al carrito");
      return [...prev, { ...line, qty: opts.initialQty ?? 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart((prev) => prev.filter((p) => cartLineKey(p) !== cartLineKey(item)));
    toast.success("Producto eliminado del carrito");
  };

  const updateQty = (item, qty) => {
    const q = Number(qty);
    if (!Number.isFinite(q) || q < 1) return;
    setCart((prev) => prev.map((p) => (cartLineKey(p) === cartLineKey(item) ? { ...p, qty: q } : p)));
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        toast.success("Eliminado de favoritos");
        return prev.filter((item) => item._id !== product._id);
      }
      toast.success("Agregado a favoritos");
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => wishlist.some((item) => item._id === productId);

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.price) * Number(item.qty || 1), 0),
    [cart]
  );

  const clearCart = () => setCart([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = {
    cart,
    wishlist,
    searchTerm,
    selectedCategory,
    maxPrice,
    cartSubtotal,
    isCartOpen,
    setSearchTerm,
    setSelectedCategory,
    setMaxPrice,
    addToCart,
    removeFromCart,
    updateQty,
    toggleWishlist,
    isWishlisted,
    clearCart,
    openCart,
    closeCart,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore debe usarse dentro de StoreProvider");
  return context;
};

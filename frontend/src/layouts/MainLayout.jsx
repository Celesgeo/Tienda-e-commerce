import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import { useStoreData } from "../hooks/useStoreData";
import { useTheme } from "../context/ThemeContext";
import { useEffect } from "react";

const MainLayout = () => {
  const { store } = useStoreData();
  const { dark } = useTheme();

  useEffect(() => {
    document.documentElement.style.setProperty("--store-primary", store?.primaryColor || "#111111");
    document.documentElement.style.setProperty("--store-secondary", store?.secondaryColor || "#fafafa");
    document.documentElement.style.setProperty("--store-accent", store?.accentColor || "#18181b");
  }, [store]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? "dark bg-zinc-950" : "bg-[var(--store-secondary,#fafafa)]"}`}
    >
      <Navbar />
      <CartDrawer />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;

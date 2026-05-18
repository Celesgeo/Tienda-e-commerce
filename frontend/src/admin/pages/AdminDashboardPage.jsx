import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";
import { formatPrice } from "../../utils/formatPrice";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    coupons: 0,
    orders: 0,
    revenue: 0,
    loading: true,
  });
  useSEO("Dashboard | Admin", "Resumen de tu tienda");

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, categoriesRes, couponsRes, ordersRes] = await Promise.all([
          api.get("/products/admin/all"),
          api.get("/categories"),
          api.get("/coupons"),
          api.get("/orders"),
        ]);
        const orders = ordersRes.data.data || [];
        const revenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
        setStats({
          products: productsRes.data.data?.length || 0,
          categories: categoriesRes.data.data?.length || 0,
          coupons: couponsRes.data.data?.length || 0,
          orders: orders.length,
          revenue,
          loading: false,
        });
      } catch (err) {
        toast.error(getApiErrorMessage(err, "No se pudo cargar el panel"));
        setStats((s) => ({ ...s, loading: false }));
      }
    };
    load();
  }, []);

  if (stats.loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Productos", value: stats.products, to: "/admin/productos" },
    { label: "Categorías", value: stats.categories, to: "/admin/categorias" },
    { label: "Cupones", value: stats.coupons, to: "/admin/cupones" },
    { label: "Pedidos", value: stats.orders, to: "/admin/ordenes" },
  ];

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Resumen operativo de tu ecommerce.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Volumen histórico (total pedidos)</p>
        <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{formatPrice(stats.revenue)}</p>
      </div>
    </section>
  );
};

export default AdminDashboardPage;

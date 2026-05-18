import {
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Palette,
  Percent,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;

const AdminLayout = () => {
  const { adminUser, logoutAdmin } = useAdminAuth();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white px-3 py-6 dark:border-zinc-800 dark:bg-zinc-900 md:flex">
          <Link to="/admin/dashboard" className="mb-8 px-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Tienda
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            <NavLink to="/admin/dashboard" className={itemClass}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/productos" className={itemClass}>
              <Package size={18} /> Productos
            </NavLink>
            <NavLink to="/admin/categorias" className={itemClass}>
              <Tags size={18} /> Categorías
            </NavLink>
            <NavLink to="/admin/ordenes" className={itemClass}>
              <ShoppingBag size={18} /> Pedidos
            </NavLink>
            <NavLink to="/admin/cupones" className={itemClass}>
              <Percent size={18} /> Cupones
            </NavLink>
            <NavLink to="/admin/branding" className={itemClass}>
              <Palette size={18} /> Branding
            </NavLink>
            <NavLink to="/admin/slides" className={itemClass}>
              <ImageIcon size={18} /> Slides
            </NavLink>
            <NavLink to="/admin/configuracion" className={itemClass}>
              <Settings size={18} /> Configuración
            </NavLink>
          </nav>
          <div className="mt-auto border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="truncate px-3 text-xs text-zinc-500">{adminUser?.email}</p>
            <Link to="/" className="mt-2 block px-3 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white">
              Ver tienda pública
            </Link>
            <button
              type="button"
              onClick={logoutAdmin}
              className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="min-h-screen flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 md:hidden">
            <Link to="/admin/dashboard" className="text-sm font-semibold">
              Panel
            </Link>
            <button type="button" onClick={logoutAdmin} className="text-xs font-medium text-rose-600">
              Salir
            </button>
          </header>
          <main className="p-4 md:p-8 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

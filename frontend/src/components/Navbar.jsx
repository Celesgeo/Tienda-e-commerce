import { Heart, Moon, Search, ShoppingBag, Sun, Store } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useStoreData } from "../hooks/useStoreData";
import { useTheme } from "../context/ThemeContext";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"}`;

const Navbar = () => {
  const { cart, wishlist, searchTerm, setSearchTerm, openCart } = useStore();
  const { store } = useStoreData();
  const { dark, toggleDark } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {store?.logo ? (
            <img src={store.logo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Store size={18} />
            </span>
          )}
          <span className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white md:text-lg">
            {store?.name || "Tienda"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={linkClass} end>
            Inicio
          </NavLink>
          <NavLink to="/categorias" className={linkClass}>
            Categorías
          </NavLink>
          <NavLink to="/carrito" className={linkClass}>
            Carrito
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden max-w-xs items-center rounded-full border border-zinc-200 bg-zinc-50/80 px-3 py-2 md:flex dark:border-zinc-800 dark:bg-zinc-900/80">
            <Search size={16} className="shrink-0 text-zinc-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en la tienda…"
              className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={toggleDark}
            className="rounded-full border border-zinc-200 p-2 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Cambiar tema"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/login"
            className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 sm:inline dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Panel
          </Link>

          <Link to="/wishlist" className="relative rounded-full p-2 text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
            <Heart size={20} />
            {wishlist.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                {wishlist.length}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                {cart.reduce((a, i) => a + (i.qty || 1), 0)}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-4 pb-3 md:hidden dark:border-zinc-800">
        <div className="flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <Search size={16} className="text-zinc-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar…"
            className="ml-2 w-full bg-transparent text-sm outline-none dark:text-white"
          />
        </div>
        <Link
          to="/login"
          className="mt-2 block w-full rounded-full border border-zinc-200 py-2 text-center text-xs font-semibold dark:border-zinc-700"
        >
          Panel comercio
        </Link>
      </div>
    </header>
  );
};

export default Navbar;

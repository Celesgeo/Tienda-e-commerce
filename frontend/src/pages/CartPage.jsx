import { Link } from "react-router-dom";
import { cartLineKey, useStore } from "../context/StoreContext";
import useSEO from "../hooks/useSEO";
import { formatPrice } from "../utils/formatPrice";

const CartPage = () => {
  const { cart, cartSubtotal, removeFromCart, updateQty } = useStore();
  useSEO("Carrito | Tienda", "Revisá tu carrito y finalizá tu compra.");

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-4xl">Carrito</h1>
      {!cart.length ? (
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-zinc-600 dark:text-zinc-300">Tu carrito está vacío.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {cart.map((item) => (
              <article
                key={cartLineKey(item)}
                className="flex gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {item.imageUrl || item.images?.[0]?.url ? (
                  <img
                    src={item.imageUrl || item.images?.[0]?.url}
                    alt=""
                    className="h-28 w-24 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-400 dark:bg-zinc-800">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">{item.name}</h2>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-sm text-zinc-500">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{formatPrice(item.price)} c/u</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-xs text-zinc-500">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateQty(item, Number(e.target.value))}
                        className="ml-2 w-20 rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item)}
                      className="text-sm font-medium text-rose-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Subtotal</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{formatPrice(cartSubtotal)}</p>
            <Link
              to="/checkout"
              className="mt-6 block rounded-full bg-zinc-900 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
            >
              Ir al checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;

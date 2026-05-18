import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { cartLineKey, useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/formatPrice";

const CartDrawer = () => {
  const { cart, cartSubtotal, isCartOpen, closeCart, removeFromCart, updateQty } = useStore();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition dark:bg-black/70 ${
          isCartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl transition duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Tu carrito</h3>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {!cart.length ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tu carrito está vacío</p>
              <p className="mt-1 text-xs text-zinc-500">Agregá productos desde el catálogo.</p>
              <Link
                to="/"
                onClick={closeCart}
                className="mt-4 inline-block rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
              >
                Explorar tienda
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={cartLineKey(item)}
                className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                {(item.imageUrl || item.images?.[0]?.url) ? (
                  <img
                    src={item.imageUrl || item.images?.[0]?.url}
                    alt=""
                    className="h-20 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-[10px] text-zinc-500 dark:bg-zinc-800">
                    —
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-xs text-zinc-500">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{formatPrice(item.price)} c/u</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item, Number(e.target.value))}
                      className="w-14 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(item)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-zinc-100 bg-white px-5 py-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Subtotal</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{formatPrice(cartSubtotal)}</p>
          <Link
            to="/checkout"
            onClick={closeCart}
            className="mt-4 block rounded-full bg-zinc-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Ir al checkout
          </Link>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;

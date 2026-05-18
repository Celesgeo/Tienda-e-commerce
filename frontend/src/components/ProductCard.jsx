import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/formatPrice";

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const liked = isWishlisted(product._id);
  const cover = product.imageUrl || (product.images && product.images[0]?.url) || "";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <Link to={`/producto/${product._id}`} className="relative block aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
          {product.featured ? (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">Destacado</span>
          ) : null}
          {product.isNewArrival ? (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">Nuevo</span>
          ) : null}
          {product.isOnSale ? (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">Oferta</span>
          ) : null}
        </div>
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Sin imagen
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {product.category?.name || "Catálogo"}
            </p>
            <Link to={`/producto/${product._id}`}>
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-white md:text-base">
                {product.name}
              </h3>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="shrink-0 rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Favoritos"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-500" : ""} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-xs text-zinc-400 line-through">{formatPrice(product.compareAtPrice)}</p>
            ) : null}
            <p className="text-base font-bold text-zinc-900 dark:text-white">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

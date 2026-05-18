import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import useSEO from "../hooks/useSEO";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/related`).catch(() => ({ data: { data: [] } })),
        ]);
        setProduct(pRes.data.data);
        setRelated(rRes.data.data || []);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const colors = product.colors || [];
    const sizes = product.sizes || [];
    setColor(colors[0] || "");
    setSize(sizes[0] || "");
    setGalleryIndex(0);
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const main = product.imageUrl ? [{ url: product.imageUrl, key: "main" }] : [];
    const extra = (product.images || []).map((img, i) => ({ url: img.url, key: `g-${i}` }));
    return [...main, ...extra].filter((x) => x.url);
  }, [product]);

  useSEO(
    product ? `${product.name} | Tienda` : "Producto | Tienda",
    product?.description || "Detalle de producto",
    gallery[0]?.url || ""
  );

  if (loading) {
    return (
      <div className="grid animate-pulse gap-8 lg:grid-cols-2">
        <div className="aspect-[3/4] rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-6 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-300">Producto no encontrado.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-zinc-900 underline dark:text-white">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const currentImage = gallery[galleryIndex]?.url;
  const needsVariant = (product.colors?.length && !color) || (product.sizes?.length && !size);
  const liked = isWishlisted(product._id);

  return (
    <section className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="space-y-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          {currentImage ? (
            <img src={currentImage} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500">Sin imagen</div>
          )}
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow dark:bg-zinc-900/90"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow dark:bg-zinc-900/90"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.map((g, idx) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGalleryIndex(idx)}
                className={`h-16 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  idx === galleryIndex ? "border-zinc-900 dark:border-white" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={g.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {product.category?.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-white">{product.name}</h1>

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-lg text-zinc-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Stock disponible: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{product.stock}</span>
        </p>

        {product.colors?.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    color === c
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.sizes?.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Talle</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-[3rem] rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    size === s
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.description ? (
          <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{product.description}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={Boolean(needsVariant) || product.stock < 1}
            onClick={() => addToCart(product, { color, size })}
            className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Agregar al carrito
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium dark:border-zinc-700"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-500" : ""} />
            Favoritos
          </button>
        </div>
        {needsVariant ? (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">Seleccioná color y/o talle para agregar al carrito.</p>
        ) : null}
      </div>

      {related.length > 0 && (
        <div className="col-span-full border-t border-zinc-200 pt-12 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">También te puede interesar</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductPage;

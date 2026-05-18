import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Carousel from "../components/Carousel";
import FiltersBar from "../components/FiltersBar";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { useStoreData } from "../hooks/useStoreData";
import useSEO from "../hooks/useSEO";
import { useProducts } from "../hooks/useProducts";

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-800" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  </div>
);

const HomePage = () => {
  const { products, categories, loading } = useProducts();
  const { store } = useStoreData();
  const { searchTerm, selectedCategory, maxPrice, setSelectedCategory, setMaxPrice } = useStore();
  const [searchParams] = useSearchParams();

  useSEO(store?.name ? `${store.name} | Tienda` : "Tienda", store?.description || "Ecommerce moderno.");

  useEffect(() => {
    const categoryFromQuery = searchParams.get("categoria");
    if (categoryFromQuery) setSelectedCategory(categoryFromQuery);
  }, [searchParams, setSelectedCategory]);

  useEffect(() => {
    if (!products.length) return;
    const hi = Math.max(...products.map((p) => Number(p.price) || 0), 1);
    setMaxPrice(hi);
  }, [products, setMaxPrice]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "all" || product.category?._id === selectedCategory;
        const matchPrice = Number(product.price) <= Number(maxPrice);
        return matchSearch && matchCategory && matchPrice;
      }),
    [products, searchTerm, selectedCategory, maxPrice]
  );

  const featured = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products]);

  if (loading) {
    return (
      <section className="space-y-10">
        <div className="h-[320px] animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800 md:h-[400px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <Carousel
        fallback={{
          bannerUrl: store?.bannerUrl,
          name: store?.name,
          heroTitle: store?.heroTitle,
          heroSubtitle: store?.heroSubtitle,
          description: store?.description,
        }}
      />

      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm md:p-10 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">Tienda</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          {store?.name || "Tu tienda"}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          {store?.description || "Productos reales desde tu panel de administración."}
        </p>
      </div>

      <FiltersBar categories={categories} products={products} />

      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Destacados</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Categorías</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
              Creá categorías desde el panel admin para verlas aquí.
            </p>
          ) : (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/?categoria=${category._id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm text-zinc-500 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-400">
                    {category.name}
                  </div>
                )}
                <div className="p-4">
                  <p className="font-semibold text-zinc-900 dark:text-white">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {category.description || "Ver productos"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Todos los productos</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {!filteredProducts.length ? (
          <div className="mt-10 rounded-3xl border border-dashed border-zinc-200 bg-white px-8 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-600 dark:text-zinc-300">No hay productos con estos filtros.</p>
            <Link to="/categorias" className="mt-4 inline-block text-sm font-semibold text-zinc-900 underline dark:text-white">
              Ver todas las categorías
            </Link>
          </div>
        ) : null}
      </section>
    </section>
  );
};

export default HomePage;

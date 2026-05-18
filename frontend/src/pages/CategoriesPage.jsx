import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import useSEO from "../hooks/useSEO";
import { useProducts } from "../hooks/useProducts";

const CategoriesPage = () => {
  const { categories, loading } = useProducts();
  useSEO("Categorias | Tienda", "Explora categorias y encuentra tu estilo.");
  if (loading) return <Loader />;

  return (
    <section>
      <h1 className="text-2xl font-semibold md:text-4xl">Categorias</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/?categoria=${category._id}`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Categoria</p>
            <h2 className="mt-2 text-xl font-medium">{category.name}</h2>
            <p className="mt-2 text-sm text-zinc-600">{category.description || "Sin descripcion"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;

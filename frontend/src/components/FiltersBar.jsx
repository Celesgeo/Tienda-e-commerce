import { useMemo } from "react";
import { useStore } from "../context/StoreContext";

const FiltersBar = ({ categories, products }) => {
  const { selectedCategory, setSelectedCategory, maxPrice, setMaxPrice } = useStore();
  const highestPrice = useMemo(
    () => Math.max(...products.map((item) => Number(item.price || 0)), 1000),
    [products]
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-500">Categoria</label>
          <select
            className="w-full rounded-lg border border-zinc-200 p-2 text-sm outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-500">
            Precio maximo: ${Math.round(maxPrice)}
          </label>
          <input
            type="range"
            min="0"
            max={highestPrice}
            value={Math.min(maxPrice, highestPrice)}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
};

export default FiltersBar;

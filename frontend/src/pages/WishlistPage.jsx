import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import useSEO from "../hooks/useSEO";

const WishlistPage = () => {
  const { wishlist } = useStore();
  useSEO("Wishlist | Tienda", "Tus productos favoritos guardados.");
  return (
    <section>
      <h1 className="text-2xl font-semibold md:text-4xl">Wishlist</h1>
      {!wishlist.length ? (
        <p className="mt-6 text-zinc-600">Aun no guardaste favoritos.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistPage;

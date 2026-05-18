import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="flex min-h-[60vh] flex-col items-center justify-center">
    <h1 className="text-5xl font-semibold">404</h1>
    <p className="mt-2 text-zinc-500">Pagina no encontrada</p>
    <Link to="/" className="mt-5 rounded-full bg-black px-4 py-2 text-white">
      Volver al inicio
    </Link>
  </section>
);

export default NotFoundPage;

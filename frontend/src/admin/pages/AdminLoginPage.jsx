import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import useSEO from "../../hooks/useSEO";
import { getApiErrorMessage } from "../../utils/apiErrorMessage";

const AdminLoginPage = () => {
  const { loginAdmin, isAdminLogged } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicLogin = location.pathname === "/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useSEO(isPublicLogin ? "Acceso comercio | Tienda" : "Admin | Tienda", "Ingreso administrador");

  useEffect(() => {
    if (isAdminLogged) navigate("/admin/dashboard", { replace: true });
  }, [isAdminLogged, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await loginAdmin({ email, password });
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo iniciar sesión"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400">
            ← Volver a la tienda
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {isPublicLogin ? "Panel del comercio" : "Administración"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ingresá con tu cuenta de administrador para gestionar productos, pedidos y la tienda.
          </p>
          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-500">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="admin@tutienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Contraseña
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Ingresando…" : "Ingresar al panel"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminLoginPage;

import axios from "axios";
import toast from "react-hot-toast";

const explicitUrl = import.meta.env.VITE_API_URL?.trim();

const baseURL =
  explicitUrl && explicitUrl.length > 0
    ? explicitUrl
    : import.meta.env.DEV
      ? "/api"
      : "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const rawToken = localStorage.getItem("admin_token");
  let token = "";
  try {
    token = rawToken ? JSON.parse(rawToken) : "";
  } catch {
    token = rawToken || "";
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const hadAuth = Boolean(err.config?.headers?.Authorization);

    if (status === 401 && hadAuth) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      const p = window.location.pathname;
      if (p !== "/admin/login" && p !== "/login") {
        window.location.assign("/admin/login");
      }
    }

    if (status === 403 && hadAuth) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      const p = window.location.pathname;
      if (p !== "/admin/login" && p !== "/login") {
        toast.error("Sin permisos de administrador. Si acabás de darte rol admin en la base de datos, volvé a iniciar sesión.");
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;

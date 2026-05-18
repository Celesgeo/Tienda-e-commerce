/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "../hooks/useLocalStorage";
import api from "../services/api";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useLocalStorage("admin_token", "");
  const [adminUser, setAdminUser] = useLocalStorage("admin_user", null);
  const isAdminLogged = Boolean(adminToken && adminUser?.role === "admin");

  const loginAdmin = async ({ email, password }) => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdminToken("");
    setAdminUser(null);
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data.data;
    if (user.role !== "admin") {
      throw new Error("Este usuario no es administrador");
    }
    localStorage.setItem("admin_token", JSON.stringify(token));
    localStorage.setItem("admin_user", JSON.stringify(user));
    setAdminToken(token);
    setAdminUser(user);
    toast.success("Sesion admin iniciada");
  };

  const logoutAdmin = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdminToken("");
    setAdminUser(null);
    toast.success("Sesion cerrada");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAdminLogged,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
  return context;
};

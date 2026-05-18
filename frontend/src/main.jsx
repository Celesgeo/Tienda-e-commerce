import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { StoreProvider } from "./context/StoreContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <StoreProvider>
            <App />
            <Toaster position="bottom-right" toastOptions={{ className: "dark:bg-zinc-800 dark:text-white" }} />
          </StoreProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

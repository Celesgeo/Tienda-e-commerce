import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "http://127.0.0.1:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: env.VITE_PROXY_TARGET || "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
  };
});

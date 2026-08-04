import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy all /api/* requests to the PHP backend during development.
    // This makes every request same-origin (localhost:5173 → localhost:5173/api/...)
    // so the browser never triggers a CORS preflight — the most reliable dev setup.
    //
    // To change the backend target, set VITE_BACKEND_URL in your .env:
    //   VITE_BACKEND_URL=http://localhost:8000
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost/mediconnect/backend",
        changeOrigin: true,
        // Strip the /api prefix before forwarding: /api/auth/login.php → /auth/login.php
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Forward cookies so PHP sessions work across the proxy
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("[proxy] Backend unreachable:", err.message);
          });
        },
      },
    },
  },
});

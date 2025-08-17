import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [react()],
    root: path.resolve(__dirname, "client"),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
      },
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});

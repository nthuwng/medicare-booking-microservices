import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173 ,
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router", "react-router-dom"],
          axios: ["axios"],
          lottie: ["lottie-web"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
  },
});
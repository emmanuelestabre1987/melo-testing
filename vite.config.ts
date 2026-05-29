import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "robots.txt"],
      manifest: {
        name: "Melo Envíos — Logística comunitaria",
        short_name: "Melo Envíos",
        description: "Conectá transportistas, cargas y viajeros en tu comunidad. Publicá, buscá y hacé match.",
        lang: "es",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libs into long-term-cacheable chunks.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("leaflet")) return "leaflet";
          if (id.includes("recharts") || id.includes("/d3-")) return "charts";
          if (id.includes("@supabase")) return "supabase";
          // Keep React core, react-dom, scheduler and router in ONE chunk.
          // If react core lands in a different chunk than react-dom, react-dom
          // reads React.__SECRET_INTERNALS_... before React is defined → blank page.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react/jsx-runtime") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/")
          )
            return "react-vendor";
          return "vendor";
        },
      },
    },
  },
}));

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
  // Source maps in prod so runtime crashes show real file:line instead of
  // minified frames (index-*.js:41:26080). Temporary diagnostic — can be
  // turned off once the current crash is pinned down.
  build: {
    sourcemap: true,
  },
  // NOTE: no custom manualChunks here on purpose. Hand-splitting React into a
  // separate chunk from its dependents (Radix, react-hook-form, router, etc.)
  // caused cross-chunk load-order crashes in production (React undefined when a
  // vendor lib calls createContext / reads __SECRET_INTERNALS). Vite's default
  // chunking resolves the dependency graph order correctly — leave it to Vite.
}));

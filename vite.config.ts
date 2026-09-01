import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  plugins: [react()],
  build: {
    // Modern baseline. Every browser this targets supports the syntax natively,
    // so the output ships no regenerator/spread/class-property downlevelling.
    target: ["es2022", "chrome111", "edge111", "firefox111", "safari16.4"],
    cssTarget: ["chrome111", "edge111", "firefox111", "safari16.4"],
    // Source maps let Lighthouse and error tracking map the minified bundle
    // back to source. They are separate files, so visitors never download them.
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split the long-lived vendor code out of the app chunk so a content
        // change does not invalidate React and the router for returning users.
        // Rolldown (Vite 8) only accepts the function form.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (/[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/.test(id)) return "router";
          if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return "query";
          // Everything else is left to split naturally, so a lazy route pulls
          // only the Radix primitives and widgets it actually imports rather
          // than one shared megabundle.
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));

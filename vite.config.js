import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["gsap", "gsap/ScrollTrigger", "gsap/ScrollToPlugin", "lenis"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});

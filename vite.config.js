import { defineConfig } from "vite";

function cleanUrlRoutes() {
  const routes = {
    "/company-profile": "/company-profile.pdf",
    "/company-profile/": "/company-profile.pdf",
    "/company-brief-overview": "/company-brief-overview.pdf",
    "/company-brief-overview/": "/company-brief-overview.pdf",
    "/play-to-win": "/play-to-win.html",
    "/play-to-win/": "/play-to-win.html",
    "/vmware": "/vmware.pdf",
    "/vmware/": "/vmware.pdf",
  };

  const rewrite = (req, _res, next) => {
    const url = req.url?.split("?")[0];
    if (url && routes[url]) {
      req.url = routes[url];
    }
    next();
  };

  return {
    name: "clean-url-routes",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [cleanUrlRoutes()],
  build: {
    outDir: "dist",
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["gsap", "gsap/ScrollTrigger", "gsap/ScrollToPlugin", "lenis"],
          three: ["three"],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});

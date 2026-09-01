import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";

export function initMarkets() {
  const root = document.querySelector("#markets .market-stage");
  if (!root) return;

  const nav = [...root.querySelectorAll(".market-stage__nav [data-stage]")];
  const panels = [...root.querySelectorAll(".market-stage__panel")];
  const orb = root.querySelector(".market-stage__orb");
  const canvas = root.querySelector(".market-stage__canvas");
  const globeRoot = root.querySelector("[data-globe]");
  const reduce = prefersReducedMotion();
  let current = null;
  let incoming;
  let globe = null;

  gsap.set(panels, { autoAlpha: 0, y: 28 });
  if (orb) gsap.set(orb, { xPercent: -50, yPercent: -50, x: 420, y: 220 });

  const show = (region) => {
    globe?.focusRegion(region);
    if (region === current) return;

    const next = panels.find((panel) => panel.dataset.stage === region);
    const prev = panels.find((panel) => panel.dataset.stage === current);
    if (!next) return;

    current = region;
    nav.forEach((item) => {
      item.setAttribute("aria-selected", String(item.dataset.stage === region));
    });
    panels.forEach((panel) => panel.classList.toggle("is-on", panel === next));

    incoming?.kill();
    incoming = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (prev) {
      incoming.to(prev, { autoAlpha: 0, y: reduce ? 0 : -16, duration: reduce ? 0 : 0.22 }, 0);
    }

    const lines = next.querySelectorAll("li");
    if (reduce) {
      gsap.set(next, { autoAlpha: 1, y: 0 });
      gsap.set(lines, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(lines, { autoAlpha: 0, y: 12 });
      incoming.fromTo(
        next,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.38 },
        prev ? 0.08 : 0
      );
      incoming.to(lines, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.045 }, "<0.05");
    }
  };

  nav.forEach((btn) => {
    btn.addEventListener("click", () => show(btn.dataset.stage));
  });

  if (orb && window.matchMedia(mq.finePointer).matches && !reduce) {
    const xTo = gsap.quickTo(orb, "x", { duration: 0.85, ease: "power3" });
    const yTo = gsap.quickTo(orb, "y", { duration: 0.85, ease: "power3" });
    root.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const box = root.getBoundingClientRect();
      xTo(event.clientX - box.left);
      yTo(event.clientY - box.top);
    });
  }

  const mountGlobe = async () => {
    try {
      const { createMarketGlobe } = await import("./globe.js");
      globe = createMarketGlobe(globeRoot);
      if (globe) {
        canvas?.classList.add("has-globe");
        globeRoot?.classList.add("is-ready");
        if (current) globe.focusRegion(current);
      } else {
        canvas?.classList.remove("has-globe");
      }
    } catch {
      canvas?.classList.remove("has-globe");
    }
  };

  if (globeRoot && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        mountGlobe();
      },
      { rootMargin: "320px" }
    );
    io.observe(root);
  } else if (globeRoot) {
    mountGlobe();
  }

  if (nav[0]) show(nav[0].dataset.stage);
}

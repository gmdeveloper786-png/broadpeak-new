import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./config.js";

let lenis;

export function initSmoothScroll() {
  if (prefersReducedMotion()) return null;

  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.085,
    smoothWheel: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToTarget(target, offsetY = 0) {
  if (lenis) {
    lenis.start();
    lenis.scrollTo(target, {
      offset: offsetY,
      duration: 1.15,
      // Allow scroll even if Lenis was stopped (e.g. mobile nav open).
      force: true,
      lock: true,
    });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

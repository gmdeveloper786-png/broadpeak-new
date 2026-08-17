import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import "lenis/dist/lenis.css";
import { playLoader } from "./animations/loader.js";
import { SITE_CONFIG, prefersReducedMotion } from "./config.js";
import { initSmoothScroll } from "./smooth-scroll.js";
import { initHeader, playHeaderIntro } from "./animations/header.js";
import { initHero, initAltitudeMeter } from "./animations/hero.js";
import { initAbout } from "./animations/about.js";
import { initMarkets } from "./animations/markets.js";
import { initSolutions } from "./animations/solutions.js";
import { initNetwork } from "./animations/network.js";
import { initDifference } from "./animations/difference.js";
import { initValueProposition } from "./animations/value.js";
import { initProcess } from "./animations/process.js";
import { initConsultancy } from "./animations/consultancy.js";
import { initCTA } from "./animations/cta.js";
import { initFooter } from "./animations/footer.js";
import { initHeadingReveal } from "./animations/headings.js";
import { initCursor } from "./animations/cursor.js";

import "../css/reset.css";
import "../css/variables.css";
import "../css/base.css";
import "../css/components.css";
import "../css/sections.css";
import "../css/animations.css";
import "../css/responsive.css";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.defaults({ ease: "power2.out" });

async function preloadCritical() {
  const src = SITE_CONFIG.hero.image;
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
  } catch {
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }
}

async function boot() {
  SITE_CONFIG.reducedMotion = prefersReducedMotion();

  const ready = Promise.race([
    preloadCritical(),
    new Promise((r) => setTimeout(r, 2400)),
  ]);

  initSmoothScroll();
  initHeader();
  initHero();
  initAbout();
  initMarkets();
  initSolutions();
  initNetwork();
  initDifference();
  initValueProposition();
  initProcess();
  initConsultancy();
  initCTA();
  initFooter();
  initHeadingReveal();
  initAltitudeMeter();
  initCursor();

  await playLoader({ ready });
  playHeaderIntro();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

window.addEventListener("load", () => ScrollTrigger.refresh());

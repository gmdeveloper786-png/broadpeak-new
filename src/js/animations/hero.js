import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_CONFIG, prefersReducedMotion } from "../config.js";
import { createHeroRenderer } from "./hero-sequence.js";

function setAltitude(el, meters) {
  if (!el) return;
  el.textContent = `${meters.toLocaleString("en-US")} m`;
}

function altitudeFromProgress(progress) {
  return Math.round(
    SITE_CONFIG.summitAltitude +
      (SITE_CONFIG.endAltitude - SITE_CONFIG.summitAltitude) * progress
  );
}

export function initHero() {
  const section = document.querySelector("#hero");
  const sticky = section?.querySelector(".hero__sticky");
  const canvas = section?.querySelector(".hero__canvas");
  const altEl = document.querySelector("[data-altitude]");
  const phases = gsap.utils.toArray(".hero__phase");
  const mist = section?.querySelector(".hero__mist");
  if (!section || !sticky || !canvas) return null;

  const renderer = createHeroRenderer(canvas);
  const reduce = prefersReducedMotion();

  renderer.init().then(() => {
    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", () => renderer.resize(), { passive: true });

  setAltitude(altEl, SITE_CONFIG.summitAltitude);

  if (reduce) {
    gsap.set(phases, { autoAlpha: 0, y: 0 });
    if (phases[0]) gsap.set(phases[0], { autoAlpha: 1 });
    renderer.render(0);
    return renderer;
  }

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
    },
    (context) => {
      const { isDesktop } = context.conditions;
      const distance = isDesktop
        ? SITE_CONFIG.hero.desktopScrollDistance
        : SITE_CONFIG.hero.mobileScrollDistance;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * distance)}`,
          pin: sticky,
          pinSpacing: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            renderer.render(self.progress);
          },
        },
      });

      gsap.set(phases, { autoAlpha: 0, xPercent: -50, yPercent: -50, y: 36 });
      gsap.set(phases[0], { autoAlpha: 1, y: 0 });

      tl.to(phases[0], { autoAlpha: 0, y: -24, duration: 0.28 }, 0.58);
      if (mist) tl.to(mist, { opacity: 1, yPercent: 8, duration: 0.32 }, 0.62);

      return () => {};
    }
  );

  return renderer;
}

export function initAltitudeMeter() {
  const altEl = document.querySelector("[data-altitude]");
  if (!altEl) return;

  setAltitude(altEl, SITE_CONFIG.summitAltitude);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    invalidateOnRefresh: true,
    refreshPriority: 100,
    onUpdate: (self) => {
      setAltitude(altEl, altitudeFromProgress(self.progress));
    },
  });
}

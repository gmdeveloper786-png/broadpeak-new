import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, mq } from "../config.js";

function animateCount(el, to, format) {
  const obj = { v: 0 };
  gsap.to(obj, {
    v: to,
    duration: 1.45,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = format ? format(obj.v) : `${Math.round(obj.v)}`;
    },
  });
}

export function initAbout() {
  const section = document.querySelector("#about");
  if (!section) return;

  const stats = gsap.utils.toArray(section.querySelectorAll(".about-stat"));
  const rule = section.querySelector(".about__rule i");
  const reduce = prefersReducedMotion();

  if (reduce) {
    if (rule) gsap.set(rule, { scaleX: 1 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      once: true,
    },
  });

  tl.from(section.querySelector(".about__top"), { y: 16, autoAlpha: 0, duration: 0.5 })
    .from(section.querySelector(".about__lede"), { y: 22, autoAlpha: 0, duration: 0.6 }, "-=0.15")
    .from(stats, { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }, "-=0.28");

  if (rule) {
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.15, ease: "power3.inOut" }, "-=0.7");
  }

  ScrollTrigger.create({
    trigger: section.querySelector(".about__stats"),
    start: "top 82%",
    once: true,
    onEnter: () => {
      const n13 = section.querySelector("[data-count='13']");
      const n13p = section.querySelector("[data-count='13plus']");
      const n9 = section.querySelector("[data-count='9']");
      const n360 = section.querySelector("[data-count='360']");
      if (n13) animateCount(n13, 13);
      if (n13p) animateCount(n13p, 13, (v) => `${Math.round(v)}+`);
      if (n9) animateCount(n9, 9);
      if (n360) animateCount(n360, 360, (v) => `${Math.round(v)}°`);
    },
  });

  const fine = window.matchMedia(mq.finePointer);
  if (!fine.matches) return;

  stats.forEach((card) => {
    const xTo = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3" });
    const value = card.querySelector(".about-stat__value");
    const vY = value ? gsap.quickTo(value, "y", { duration: 0.5, ease: "power3" }) : null;

    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.06);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.08);
      if (vY) vY(-8);
    });
    card.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
      if (vY) vY(0);
    });
  });
}

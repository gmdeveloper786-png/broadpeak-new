import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";
import { SOLUTION_ICONS } from "../data/solution-icons.js";

export function initSolutions() {
  const section = document.querySelector("#solutions");
  if (!section) return;

  const items = gsap.utils.toArray(section.querySelectorAll(".solution"));

  items.forEach((item) => {
    const key = item.dataset.icon;
    const slot = item.querySelector(".solution__icon");
    if (slot && key && SOLUTION_ICONS[key]) slot.innerHTML = SOLUTION_ICONS[key];
  });

  if (prefersReducedMotion()) return;

  gsap.from(section.querySelectorAll(".section__head .kicker, .section__head .lede"), {
    y: 18,
    autoAlpha: 0,
    stagger: 0.08,
    duration: 0.65,
    ease: "power3.out",
    scrollTrigger: { trigger: section, start: "top 75%" },
  });

  items.forEach((item) => {
    gsap.from(item, {
      y: 22,
      autoAlpha: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
      },
    });
  });
}

import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

export function initProcess() {
  const section = document.querySelector("#process");
  const pin = section?.querySelector(".process__pin");
  if (!section || !pin) return;

  const scenes = gsap.utils.toArray(section.querySelectorAll(".process-scene"));
  const images = scenes.map((scene) => scene.querySelector("img"));
  const cards = gsap.utils.toArray(section.querySelectorAll(".process-card"));
  const ticks = gsap.utils.toArray(section.querySelectorAll(".process__ticks span"));
  const count = cards.length;

  const setTick = (index) => {
    ticks.forEach((tick, i) => tick.classList.toggle("is-on", i === index));
  };

  gsap.set(scenes, { autoAlpha: 0 });
  gsap.set(scenes[0], { autoAlpha: 1 });
  gsap.set(images, { scale: 1.12, transformOrigin: "50% 50%" });
  gsap.set(cards, { y: 180, autoAlpha: 0 });
  setTick(0);

  if (prefersReducedMotion()) {
    pin.classList.add("is-static");
    gsap.set(images, { scale: 1 });
    gsap.set(cards, { y: 0, autoAlpha: 1 });
    gsap.set(scenes, { autoAlpha: 0 });
    gsap.set(scenes[0], { autoAlpha: 1 });
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=460%",
      pin,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const index = Math.min(count - 1, Math.floor(self.progress * count + 0.001));
        setTick(index);
      },
    },
  });

  cards.forEach((card, i) => {
    const start = i * 1.15;
    tl.to(images[i], { scale: 1, duration: 1.15 }, start);
    tl.fromTo(
      card,
      { y: 160, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.42 },
      start + 0.08
    );
    if (i < count - 1) {
      tl.to(card, { y: -130, autoAlpha: 0, duration: 0.38 }, start + 0.8);
      tl.to(scenes[i + 1], { autoAlpha: 1, duration: 0.42 }, start + 0.76);
      tl.to(scenes[i], { autoAlpha: 0, duration: 0.38 }, start + 0.86);
    }
  });

  tl.to({}, { duration: 0.4 });
}

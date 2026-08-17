import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

const ENTER = [
  { x: -18, y: 0.95, rot: -12 },
  { x: 22, y: 1.02, rot: 10 },
  { x: -26, y: 1.08, rot: 6 },
  { x: 20, y: 0.98, rot: -9 },
  { x: -14, y: 1.14, rot: -5 },
  { x: 16, y: 1.06, rot: 8 },
];

const REST_ROT = [-8, 7, 4, -6, -3, 5];

function vh(n) {
  return window.innerHeight * n;
}

export function initConsultancy() {
  const section = document.querySelector("#consultancy");
  const pin = section?.querySelector(".consult__pin");
  if (!section || !pin) return;

  const cards = gsap.utils.toArray(section.querySelectorAll(".consult-card"));

  cards.forEach((card, i) => {
    gsap.set(card, { rotation: REST_ROT[i] ?? 0, force3D: true });
  });

  if (prefersReducedMotion()) return;

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    const tl = gsap.timeline({
      defaults: { ease: "none", force3D: true },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=280%",
        pin,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card, i) => {
      const lane = ENTER[i] ?? ENTER[0];
      tl.fromTo(card, {
        x: lane.x,
        y: () => vh(lane.y),
        opacity: 0,
        rotation: lane.rot,
      }, {
        x: 0,
        y: 0,
        opacity: 1,
        rotation: REST_ROT[i] ?? 0,
        duration: 1.15,
      }, i * 0.48);
    });

    tl.to({}, { duration: 0.7 });
  });

  mm.add("(max-width: 1023px)", () => {
    cards.forEach((card, i) => {
      gsap.set(card, { rotation: (REST_ROT[i] ?? 0) * 0.4 });
      gsap.fromTo(card, {
        y: 72,
      }, {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom 70%",
          scrub: 1.15,
        },
      });
    });
  });
}

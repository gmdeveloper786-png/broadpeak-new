import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

export function initDifference() {
  const section = document.querySelector("#difference");
  const pin = section?.querySelector(".difference__pin");
  const viewport = section?.querySelector(".diff-viewport");
  const track = section?.querySelector(".diff-track");
  if (!section || !pin || !viewport || !track) return;

  if (prefersReducedMotion()) return;

  const shift = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

  gsap.to(track, {
    x: () => -shift(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${shift()}`,
      pin,
      scrub: 0.9,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

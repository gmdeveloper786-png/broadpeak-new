import { prefersReducedMotion } from "../config.js";

export function initNetwork() {
  const track = document.querySelector(".marquee__track");
  if (!track) return;

  if (prefersReducedMotion()) {
    track.style.animation = "none";
    track.style.transform = "none";
  }
}

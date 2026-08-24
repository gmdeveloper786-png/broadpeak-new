import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";

export function initMarkets() {
  const root = document.querySelector("#markets .market-stage");
  if (!root) return;

  const nav = [...root.querySelectorAll(".market-stage__nav [data-stage]")];
  const panels = [...root.querySelectorAll(".market-stage__panel")];
  const stamp = root.querySelector(".market-stage__stamp");
  const orb = root.querySelector(".market-stage__orb");
  const reduce = prefersReducedMotion();
  let current = null;
  let incoming;

  gsap.set(panels, { autoAlpha: 0, y: 28 });
  if (orb) gsap.set(orb, { xPercent: -50, yPercent: -50, x: 420, y: 220 });

  const show = (region) => {
    if (region === current) return;

    const next = panels.find((panel) => panel.dataset.stage === region);
    const prev = panels.find((panel) => panel.dataset.stage === current);
    const btn = nav.find((item) => item.dataset.stage === region);
    if (!next) return;

    current = region;
    nav.forEach((item) => {
      item.setAttribute("aria-selected", String(item.dataset.stage === region));
    });
    panels.forEach((panel) => panel.classList.toggle("is-on", panel === next));
    if (stamp && btn) stamp.textContent = btn.dataset.index || "";

    incoming?.kill();
    incoming = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (prev) {
      incoming.to(prev, { autoAlpha: 0, y: reduce ? 0 : -20, duration: reduce ? 0 : 0.28 }, 0);
    }

    const lines = next.querySelectorAll("li");
    if (reduce) {
      gsap.set(next, { autoAlpha: 1, y: 0 });
      gsap.set(lines, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(lines, { autoAlpha: 0, y: 22 });
      incoming.fromTo(
        next,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.42 },
        prev ? 0.1 : 0
      );
      incoming.to(lines, { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.055 }, "<0.06");
      if (stamp) {
        incoming.fromTo(stamp, { autoAlpha: 0.2, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.55 }, 0);
      }
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

  if (nav[0]) show(nav[0].dataset.stage);
}

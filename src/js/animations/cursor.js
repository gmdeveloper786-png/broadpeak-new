import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";

const HOVER_SEL = "a, button, [data-scroll-to], .nav-toggle, input, textarea, select, label, .about-stat, .solution, .market-card";
const BLOB_SEL = ".nav__link, .footer__col a";

export function initCursor() {
  const root = document.querySelector(".cursor");
  const dot = root?.querySelector(".cursor__dot");
  const ring = root?.querySelector(".cursor__ring");
  if (!root || !dot || !ring) return;

  const fine = window.matchMedia(mq.finePointer);
  if (!fine.matches || prefersReducedMotion()) {
    root.remove();
    return;
  }

  document.documentElement.classList.add("has-custom-cursor");
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
  gsap.set(root, { autoAlpha: 0 });

  const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });
  const ringScale = gsap.quickTo(ring, "scale", { duration: 0.35, ease: "power3" });
  const dotScale = gsap.quickTo(dot, "scale", { duration: 0.35, ease: "power3" });

  let visible = false;
  let onBlob = false;

  const show = () => {
    if (visible || onBlob) return;
    visible = true;
    gsap.to(root, { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
  };

  const hide = () => {
    visible = false;
    gsap.to(root, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
  };

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    onBlob = Boolean(e.target?.closest?.(BLOB_SEL));
    if (onBlob) {
      hide();
      return;
    }
    show();
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  }, { passive: true });

  document.addEventListener("mouseover", (e) => {
    const blob = Boolean(e.target.closest(BLOB_SEL));
    const hover = !blob && Boolean(e.target.closest(HOVER_SEL));
    root.classList.toggle("is-hover", hover);
    ringScale(hover ? 1.55 : 1);
    dotScale(hover ? 0.55 : 1);
  });

  document.documentElement.addEventListener("mouseleave", hide);
  window.addEventListener("blur", hide);
}

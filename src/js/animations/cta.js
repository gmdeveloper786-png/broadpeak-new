import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, mq } from "../config.js";

function spawnSparks(root) {
  const count = 52;
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("span");
    spark.className = "cta__spark";
    root.appendChild(spark);
    gsap.set(spark, {
      left: `${gsap.utils.random(3, 97)}%`,
      top: `${gsap.utils.random(6, 94)}%`,
      scale: gsap.utils.random(0.35, 1.7),
      opacity: gsap.utils.random(0.12, 0.75),
    });
    gsap.to(spark, {
      x: gsap.utils.random(-70, 70),
      y: gsap.utils.random(-90, 90),
      duration: gsap.utils.random(3.2, 7.5),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: gsap.utils.random(0, 2),
    });
    gsap.to(spark, {
      opacity: gsap.utils.random(0.08, 0.95),
      duration: gsap.utils.random(1.1, 2.6),
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }
}

export function initCTA() {
  const section = document.querySelector("#contact");
  const footer = document.querySelector("#site-footer");
  if (!section) return;

  const sparks = section.querySelector(".cta__sparks");
  const fill = footer?.querySelector(".footer__altimeter-fill");
  const node = footer?.querySelector(".footer__altimeter-node");

  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: "top 92%",
      end: "bottom bottom",
      onToggle: (self) => {
        document.body.classList.toggle("is-at-footer", self.isActive);
      },
    });
  }

  if (prefersReducedMotion()) {
    if (fill) gsap.set(fill, { width: "100%" });
    if (node) gsap.set(node, { left: "100%" });
    return;
  }

  if (sparks) spawnSparks(sparks);

  gsap.from(section.querySelectorAll(".cta__inner > :not(h2)"), {
    y: 28,
    autoAlpha: 0,
    stagger: 0.1,
    duration: 0.85,
    ease: "power3.out",
    scrollTrigger: { trigger: section, start: "top 68%" },
  });

  if (footer) {
    const bar = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: footer,
        start: "top 94%",
        end: "top 58%",
        scrub: 0.5,
      },
    });
    if (fill) bar.fromTo(fill, { width: "0%" }, { width: "100%", duration: 1 }, 0);
    if (node) bar.fromTo(node, { left: "0%" }, { left: "100%", duration: 1 }, 0);
  }

  const fine = window.matchMedia(mq.finePointer);
  if (!fine.matches) return;

  const field = section.querySelector(".cta__field");
  if (field) {
    const xTo = gsap.quickTo(field, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(field, "y", { duration: 0.8, ease: "power3" });
    section.addEventListener("pointermove", (e) => {
      const r = section.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 28);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 18);
    });
  }

  document.querySelectorAll(".btn--magnetic").forEach((btn) => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });

    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.22);
    });
    btn.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";

export function initSolutions() {
  const section = document.querySelector("#solutions");
  const rail = section?.querySelector(".solutions__rail");
  const card = section?.querySelector(".solution-card");
  if (!section || !rail) return;

  const items = gsap.utils.toArray(section.querySelectorAll(".solution"));
  const meta = card?.querySelector(".solution-card__meta");
  const name = card?.querySelector(".solution-card__name");
  const icon = card?.querySelector(".solution-card__icon");
  const fine = window.matchMedia(mq.finePointer);

  if (!prefersReducedMotion()) {
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

  if (!card || prefersReducedMotion() || !fine.matches) return;

  card.style.display = "block";
  gsap.set(card, { autoAlpha: 0, scale: 0.9, xPercent: -32, yPercent: -50 });

  const xTo = gsap.quickTo(card, "x", { duration: 0.55, ease: "power3" });
  const yTo = gsap.quickTo(card, "y", { duration: 0.55, ease: "power3" });

  let visible = false;

  const fill = (row) => {
    items.forEach((item) => item.classList.toggle("is-active", item === row));
    if (meta) meta.textContent = `${row.dataset.index} / FOCUS`;
    if (name) name.textContent = row.dataset.title ?? "";
    if (icon && row.dataset.icon) {
      icon.src = row.dataset.icon;
      icon.alt = row.dataset.title ?? "";
    }
  };

  const follow = (clientX, clientY) => {
    const railBox = rail.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const xMin = w * 0.32 + 16;
    const xMax = rail.offsetWidth - w * 0.68 - 16;
    const yMin = h * 0.5 + 12;
    const yMax = rail.offsetHeight - h * 0.5 - 12;
    xTo(Math.max(xMin, Math.min(xMax, clientX - railBox.left)));
    yTo(Math.max(yMin, Math.min(yMax, clientY - railBox.top)));
  };

  const show = () => {
    if (visible) return;
    visible = true;
    gsap.to(card, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.32,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const hide = () => {
    visible = false;
    items.forEach((item) => item.classList.remove("is-active"));
    gsap.to(card, {
      autoAlpha: 0,
      scale: 0.92,
      duration: 0.24,
      ease: "power2.in",
      overwrite: "auto",
    });
  };

  items.forEach((item) => {
    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      fill(item);
      follow(event.clientX, event.clientY);
      show();
    });
  });

  rail.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    follow(event.clientX, event.clientY);
  }, { passive: true });

  rail.addEventListener("pointerleave", hide);
}

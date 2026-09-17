import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";
import { SOLUTION_ICONS } from "../data/solution-icons.js";

export function initSolutions() {
  const section = document.querySelector("#solutions");
  if (!section) return;

  const items = gsap.utils.toArray(section.querySelectorAll(".solution"));

  items.forEach((item) => {
    const key = item.dataset.icon;
    const slot = item.querySelector(".solution__icon");
    const src = key && SOLUTION_ICONS[key];
    if (!slot || !src) return;

    const title = item.querySelector("h3")?.textContent?.trim() || "";
    slot.innerHTML = `<img src="${src}" alt="" width="96" height="96" decoding="async" />`;
    const img = slot.querySelector("img");
    if (img) img.alt = title;
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

  const fine = window.matchMedia(mq.finePointer);
  if (!fine.matches) return;

  items.forEach((item) => {
    const title = item.querySelector("h3");
    const icon = item.querySelector(".solution__icon");
    const img = icon?.querySelector("img");
    if (!title || !icon || !img) return;

    const shine = document.createElement("span");
    shine.className = "solution__shine";
    shine.setAttribute("aria-hidden", "true");
    item.append(shine);

    const pulse = document.createElement("span");
    pulse.className = "solution__pulse";
    pulse.setAttribute("aria-hidden", "true");
    icon.append(pulse);

    gsap.set(shine, { xPercent: -120, autoAlpha: 0 });
    gsap.set(pulse, { scale: 0.6, autoAlpha: 0 });
    gsap.set(title, { x: 0, letterSpacing: "-0.04em" });
    gsap.set([icon, img], { x: 0, y: 0, rotation: 1, rotationX: 0 });

    const iconX = gsap.quickTo(icon, "x", { duration: 0.45, ease: "power3" });
    const iconY = gsap.quickTo(icon, "y", { duration: 0.45, ease: "power3" });

    let active = false;
    let pulseTween;

    const enter = () => {
      active = true;
      item.classList.add("is-hover");

      items.forEach((other) => {
        if (other === item) return;
        other.classList.add("is-dim");
        gsap.to(other, {
          opacity: 0.38,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      gsap.timeline({ defaults: { overwrite: "auto" } })
        .to(title, {
          x: 14,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          duration: 0.55,
          ease: "power4.out",
        }, 0)
        .fromTo(
          shine,
          { xPercent: -130, autoAlpha: 0 },
          { xPercent: 130, autoAlpha: 1, duration: 0.85, ease: "power2.inOut" },
          0
        )
        .to(shine, { autoAlpha: 0, duration: 0.2 }, "-=0.15")
        .fromTo(
          icon,
          { scale: 1, rotation: 0 },
          { scale: 1.12, rotation: -8, duration: 0.55, ease: "back.out(1.8)" },
          0
        )
        .fromTo(
          img,
          { scale: 1, filter: "brightness(1) saturate(1)" },
          {
            scale: 1.1,
            filter: "brightness(1.15) saturate(1.2)",
            duration: 0.55,
            ease: "power3.out",
          },
          0
        );

      pulseTween?.kill();
      pulseTween = gsap.fromTo(
        pulse,
        { scale: 0.55, autoAlpha: 0.7 },
        {
          scale: 1.85,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 0.15,
        }
      );
    };

    const leave = () => {
      active = false;
      item.classList.remove("is-hover");

      items.forEach((other) => {
        other.classList.remove("is-dim");
        gsap.to(other, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      pulseTween?.kill();
      gsap.to(pulse, { autoAlpha: 0, scale: 0.6, duration: 0.25, overwrite: "auto" });
      gsap.to(shine, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
      gsap.to(title, {
        x: 0,
        letterSpacing: "-0.04em",
        color: "",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(icon, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(img, {
        scale: 1,
        filter: "brightness(1) saturate(1)",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const move = (event) => {
      if (!active || event.pointerType === "touch") return;
      const box = icon.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      iconX(gsap.utils.clamp(-10, 10, (event.clientX - cx) * 0.18));
      iconY(gsap.utils.clamp(-8, 8, (event.clientY - cy) * 0.18));
    };

    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      enter();
    });
    item.addEventListener("pointerleave", leave);
    item.addEventListener("pointermove", move, { passive: true });
  });
}

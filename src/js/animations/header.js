import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToTarget, getLenis } from "../smooth-scroll.js";
import { prefersReducedMotion } from "../config.js";

let introDone = false;

function measureFullWidth(inner) {
  const prev = inner.style.width;
  inner.style.width = "min(100% - (var(--gutter) * 2), 92rem)";
  const width = inner.getBoundingClientRect().width;
  inner.style.width = prev;
  return width;
}

function compactWidth(inner, logo, extra) {
  const styles = getComputedStyle(inner);
  const pad = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const gap = parseFloat(styles.gap) || 16;
  const logoW = logo?.getBoundingClientRect().width ?? 160;
  const extraW = extra
    ? Math.max(extra.getBoundingClientRect().width, extra.scrollWidth)
    : 0;
  return Math.ceil(pad + logoW + extraW + gap + 8);
}

function prepareIntro(header) {
  const inner = header.querySelector(".header__inner");
  if (!inner || prefersReducedMotion()) return;

  const logo = inner.querySelector(".logo");
  const toggle = inner.querySelector(".nav-toggle");
  const cta = inner.querySelector(".header__cta");
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const extra = desktop ? cta : toggle;

  header.classList.add("is-intro");
  gsap.set(header, { autoAlpha: 0, y: -16 });

  if (desktop) {
    gsap.set(inner.querySelectorAll(".nav__link"), {
      autoAlpha: 0,
      y: 12,
      position: "absolute",
      pointerEvents: "none",
    });
  }

  gsap.set(inner, {
    width: compactWidth(inner, logo, extra),
    overflow: "hidden",
  });
}

export function playHeaderIntro() {
  const header = document.querySelector(".header");
  const inner = header?.querySelector(".header__inner");
  if (!header || !inner) {
    introDone = true;
    return;
  }

  const finish = () => {
    introDone = true;
    header.classList.remove("is-intro");
    gsap.set(inner, { clearProps: "width,overflow" });
  };

  if (prefersReducedMotion() || introDone) {
    finish();
    return;
  }

  const logo = inner.querySelector(".logo");
  const toggle = inner.querySelector(".nav-toggle");
  const cta = inner.querySelector(".header__cta");
  const links = gsap.utils.toArray(inner.querySelectorAll(".nav__link"));
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const extra = desktop ? cta : toggle;
  const full = measureFullWidth(inner);
  const startW = compactWidth(inner, logo, extra);

  header.classList.add("is-intro");
  gsap.set(inner, { width: startW, overflow: "hidden" });

  const tl = gsap.timeline({ onComplete: finish });

  tl.to(header, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
  }, 0.15);

  tl.to(inner, {
    width: full,
    duration: 1.65,
    ease: "power2.inOut",
  }, "+=0.45");

  if (desktop && links.length) {
    tl.set(links, { position: "relative" }, "-=0.12");
    tl.to(links, {
      autoAlpha: 1,
      y: 0,
      stagger: 0.07,
      duration: 0.55,
      ease: "power3.out",
      pointerEvents: "auto",
    }, "<0.05");
  }
}

export function initHeader() {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const links = gsap.utils.toArray(".nav__link[href^='#']");
  if (!header) return;

  prepareIntro(header);

  let hidden = false;

  const showHeader = () => {
    if (!hidden) return;
    hidden = false;
    gsap.to(header, { yPercent: 0, duration: 0.48, ease: "power3.out", overwrite: "auto" });
  };

  const hideHeader = () => {
    if (!introDone || hidden || document.body.classList.contains("is-nav-open")) return;
    hidden = true;
    gsap.to(header, { yPercent: -120, duration: 0.42, ease: "power3.inOut", overwrite: "auto" });
  };

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle("is-scrolled", y > 32);

      if (!introDone || prefersReducedMotion() || document.body.classList.contains("is-nav-open")) {
        showHeader();
        return;
      }

      if (y < 72) {
        showHeader();
        return;
      }

      if (self.direction === 1) hideHeader();
      else showHeader();
    },
  });

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: () => {
      const marker = window.innerHeight * 0.32;
      let activeId = sections[0]?.id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) activeId = section.id;
      });
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
      });
    },
  });

  function closeNav() {
    document.body.classList.remove("is-nav-open");
    toggle?.setAttribute("aria-expanded", "false");
    const lenis = getLenis();
    lenis?.start();
  }

  function openNav() {
    showHeader();
    document.body.classList.add("is-nav-open");
    toggle?.setAttribute("aria-expanded", "true");
    const lenis = getLenis();
    lenis?.stop();
    nav?.querySelector("a")?.focus();
  }

  toggle?.addEventListener("click", () => {
    if (document.body.classList.contains("is-nav-open")) closeNav();
    else openNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeNav();
      scrollToTarget(target, -8);
    });
  });

  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href") || btn.dataset.scrollTo;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeNav();
      scrollToTarget(target, -8);
    });
  });
}

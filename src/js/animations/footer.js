import gsap from "gsap";
import { prefersReducedMotion, mq } from "../config.js";

export function initFooter() {
  const footer = document.querySelector("#site-footer");
  if (!footer) return;

  const canvas = footer.querySelector(".footer__canvas");
  const glow = footer.querySelector(".footer__glow");
  const letters = [...footer.querySelectorAll(".footer__letter")];

  if (prefersReducedMotion()) return;

  const fine = window.matchMedia(mq.finePointer);
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
  let raf = 0;
  let visible = false;
  let ctx = null;
  let dpr = 1;
  let gap = 28;

  const letterX = letters.map((el) => gsap.quickTo(el, "x", { duration: 0.55, ease: "power3" }));
  const letterY = letters.map((el) => gsap.quickTo(el, "y", { duration: 0.55, ease: "power3" }));
  const letterR = letters.map((el) => gsap.quickTo(el, "rotation", { duration: 0.55, ease: "power3" }));

  const glowX = glow ? gsap.quickTo(glow, "x", { duration: 0.7, ease: "power3" }) : null;
  const glowY = glow ? gsap.quickTo(glow, "y", { duration: 0.7, ease: "power3" }) : null;

  function sizeCanvas() {
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = footer.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = width < 720 ? 26 : 30;
  }

  function drawDots() {
    if (!ctx || !canvas) return;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const radius = 150;
    const mx = mouse.x;
    const my = mouse.y;

    for (let y = gap * 0.5; y < h; y += gap) {
      for (let x = gap * 0.5; x < w; x += gap) {
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.hypot(dx, dy);
        const t = mouse.inside ? Math.max(0, 1 - dist / radius) : 0;
        const ease = t * t * (3 - 2 * t);
        const push = ease * 14;
        const nx = dist ? dx / dist : 0;
        const ny = dist ? dy / dist : 0;
        const px = x - nx * push;
        const py = y - ny * push;
        const size = 1.05 + ease * 2.8;

        ctx.beginPath();
        ctx.fillStyle = ease > 0.04
          ? `rgba(0, 174, 239, ${0.14 + ease * 0.82})`
          : "rgba(170, 196, 214, 0.14)";
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function tick() {
    mouse.x += (mouse.tx - mouse.x) * 0.14;
    mouse.y += (mouse.ty - mouse.y) * 0.14;
    drawDots();
    raf = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (raf || !visible) return;
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function resetLetters() {
    letterX.forEach((to) => to(0));
    letterY.forEach((to) => to(0));
    letterR.forEach((to) => to(0));
  }

  function onMove(e) {
    const rect = footer.getBoundingClientRect();
    mouse.tx = e.clientX - rect.left;
    mouse.ty = e.clientY - rect.top;
    mouse.inside = true;

    if (glowX && glowY) {
      glowX(e.clientX - rect.left);
      glowY(e.clientY - rect.top);
    }

    if (!fine.matches) return;

    letters.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - Number(gsap.getProperty(el, "x"));
      const cy = r.top + r.height / 2 - Number(gsap.getProperty(el, "y"));
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const mag = Math.max(0, 1 - dist / 240) ** 2;
      const fromBelow = Math.max(0, dy);
      letterX[i](dx * mag * 0.1);
      letterY[i](-22 * mag - fromBelow * mag * 0.18);
      letterR[i](dx * mag * 0.024);
    });
  }

  function onEnter() {
    mouse.inside = true;
    if (glow) gsap.to(glow, { opacity: 1, duration: 0.35, overwrite: "auto" });
  }

  function onLeave() {
    mouse.inside = false;
    mouse.tx = footer.clientWidth / 2;
    mouse.ty = footer.clientHeight / 2;
    resetLetters();
    if (glow) gsap.to(glow, { opacity: 0, duration: 0.4, overwrite: "auto" });
  }

  sizeCanvas();
  mouse.tx = footer.clientWidth / 2;
  mouse.ty = footer.clientHeight * 0.72;
  mouse.x = mouse.tx;
  mouse.y = mouse.ty;
  drawDots();

  const ro = new ResizeObserver(() => {
    sizeCanvas();
    if (!visible) drawDots();
  });
  ro.observe(footer);

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) startLoop();
    else stopLoop();
  }, { threshold: 0.02 });
  io.observe(footer);

  footer.addEventListener("pointerenter", onEnter);
  footer.addEventListener("pointerleave", onLeave);
  footer.addEventListener("pointermove", onMove);
}

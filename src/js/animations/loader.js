import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

async function waitFonts() {
  if (!document.fonts) return;
  try {
    const load = document.fonts.load('800 8rem "Plus Jakarta Sans"');
    const ready = document.fonts.ready;
    await Promise.race([
      Promise.all([load, ready]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* keep going */
  }
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function viewportCenter() {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

export async function playLoader({ ready } = {}) {
  const loader = document.querySelector("#loader");
  if (!loader) {
    document.documentElement.classList.remove("is-loading");
    if (ready) await ready;
    return;
  }

  const word = loader.querySelector(".loader__word");
  const letters = [...loader.querySelectorAll(".loader__letter")];
  const bars = [...loader.querySelectorAll(".loader__bar")];
  const chars = [...loader.querySelectorAll(".loader__char")];
  const oLetter = loader.querySelector(".loader__letter--o");
  const veil = loader.querySelector(".loader__veil");

  const finish = () => {
    loader.classList.add("is-done");
    loader.setAttribute("aria-busy", "false");
    document.documentElement.classList.remove("is-loading");
    gsap.set(loader, { display: "none" });
  };

  if (prefersReducedMotion()) {
    if (ready) await ready;
    finish();
    return;
  }

  await waitFonts();

  const mid = (letters.length - 1) / 2;
  const spread = Math.min(44, window.innerWidth * 0.042);

  gsap.set(word, { autoAlpha: 1 });
  gsap.set(chars, { yPercent: 115 });
  gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(letters, {
    x: (i) => (i - mid) * spread,
  });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

  intro.to(bars, {
    scaleY: 1,
    duration: 0.4,
    stagger: { each: 0.05, from: "center" },
    ease: "power4.out",
  }, 0.1);

  letters.forEach((letter, i) => {
    const char = letter.querySelector(".loader__char");
    const bar = letter.querySelector(".loader__bar");
    const at = i === 0 ? "+=0.16" : ">-=0.18";

    intro.to(char, {
      yPercent: 0,
      duration: 0.5,
      ease: "power4.out",
    }, at);
    intro.to(bar, {
      yPercent: -130,
      autoAlpha: 0,
      duration: 0.36,
      ease: "power3.in",
    }, "<0.1");
  });

  intro.to(letters, {
    x: 0,
    duration: 0.8,
    ease: "power3.inOut",
  }, "+=0.22");

  intro.set(letters, { overflow: "visible" });

  await Promise.all([intro.then(), ready ?? Promise.resolve()]);

  if (!oLetter || !veil) {
    finish();
    return;
  }

  const others = letters.filter((el) => el !== oLetter);

  await gsap.to(others, {
    autoAlpha: 0,
    y: 18,
    duration: 0.38,
    stagger: { each: 0.025, from: "edges" },
    ease: "power2.out",
  });

  const oChar = oLetter.querySelector(".loader__char");
  const from = (oChar ?? oLetter).getBoundingClientRect();
  const { x: cx, y: cy } = viewportCenter();

  loader.appendChild(oLetter);
  gsap.set(oLetter, {
    position: "fixed",
    left: from.left,
    top: from.top,
    width: from.width,
    height: from.height,
    x: 0,
    y: 0,
    margin: 0,
    overflow: "visible",
    zIndex: 5,
    transformOrigin: "50% 50%",
    force3D: true,
  });
  gsap.set(oChar, { yPercent: 0, x: 0, y: 0 });
  gsap.set(word, { autoAlpha: 0 });

  const dx = cx - (from.left + from.width / 2);
  const dy = cy - (from.top + from.height / 2);

  await gsap.to(oLetter, {
    x: dx,
    y: dy,
    scale: 1.35,
    duration: 0.72,
    ease: "power3.inOut",
  });

  const portal = oLetter.getBoundingClientRect();
  const inner = Math.min(portal.width, portal.height) * 0.26;
  const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.78;
  const hole = { r: inner };

  gsap.set(loader, { backgroundColor: "transparent" });
  veil.style.setProperty("--hx", "50%");
  veil.style.setProperty("--hy", "50%");
  veil.style.setProperty("--hrx", `${inner}px`);
  veil.style.setProperty("--hry", `${inner}px`);

  await gsap.timeline({ defaults: { ease: "power4.inOut" } })
    .to(oLetter, {
      scale: 34,
      duration: 1.2,
    }, 0.12)
    .to(hole, {
      r: maxR,
      duration: 1.2,
      onUpdate: () => {
        veil.style.setProperty("--hrx", `${hole.r}px`);
        veil.style.setProperty("--hry", `${hole.r}px`);
      },
    }, 0.12)
    .to(oLetter, {
      autoAlpha: 0,
      duration: 0.32,
    }, 0.82);

  finish();
}

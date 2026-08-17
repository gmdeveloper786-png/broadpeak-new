import gsap from "gsap";
import { MARKETS, prefersReducedMotion, mq } from "../config.js";

const NS = "http://www.w3.org/2000/svg";
const CX = 260;
const CY = 262;
const RADIUS = 188;
const LAT0 = 26;
const LNG0 = 58;

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function project(lat, lng) {
  const φ = (lat * Math.PI) / 180;
  const λ = (lng * Math.PI) / 180;
  const φ0 = (LAT0 * Math.PI) / 180;
  const λ0 = (LNG0 * Math.PI) / 180;
  const cosc =
    Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  const x = RADIUS * Math.cos(φ) * Math.sin(λ - λ0);
  const y =
    RADIUS *
    (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0));
  return { x: CX + x, y: CY - y, front: cosc > 0.02 };
}

function pathFrom(samples) {
  let d = "";
  let drawing = false;
  samples.forEach((p) => {
    if (!p.front) {
      drawing = false;
      return;
    }
    d += drawing
      ? ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
      : `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    drawing = true;
  });
  return d;
}

function drawGlobe(svg) {
  svg.replaceChildren();
  const defs = el("defs");
  defs.innerHTML = `
    <clipPath id="market-globe-clip">
      <circle cx="${CX}" cy="${CY}" r="${RADIUS}" />
    </clipPath>
    <radialGradient id="market-globe-fill" cx="38%" cy="34%" r="68%">
      <stop offset="0%" stop-color="#12364c" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#050d14" stop-opacity="0.15"/>
    </radialGradient>
    <linearGradient id="market-globe-comet" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00aeef" stop-opacity="0"/>
      <stop offset="55%" stop-color="#7fe3ff"/>
      <stop offset="100%" stop-color="#00aeef" stop-opacity="0.2"/>
    </linearGradient>
  `;
  svg.appendChild(defs);
  svg.appendChild(el("circle", { class: "market-globe__disc", cx: CX, cy: CY, r: RADIUS }));

  const mesh = el("g", { "clip-path": "url(#market-globe-clip)" });
  for (let lng = -180; lng < 180; lng += 20) {
    const samples = [];
    for (let lat = -80; lat <= 80; lat += 4) samples.push(project(lat, lng));
    const d = pathFrom(samples);
    if (d) mesh.appendChild(el("path", { class: "market-globe__line", d }));
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    const samples = [];
    for (let lng = LNG0 - 110; lng <= LNG0 + 110; lng += 4) samples.push(project(lat, lng));
    const d = pathFrom(samples);
    if (d) mesh.appendChild(el("path", { class: "market-globe__line", d }));
  }
  svg.appendChild(mesh);
  svg.appendChild(el("circle", { class: "market-globe__limb", cx: CX, cy: CY, r: RADIUS }));

  const cometSamples = [];
  for (let t = -70; t <= 70; t += 3) cometSamples.push(project(t * 0.18 + 18, LNG0 + t));
  const cometD = pathFrom(cometSamples);
  if (cometD) {
    svg.appendChild(el("path", { class: "market-globe__comet", d: cometD }));
  }

  const nodes = el("g");
  MARKETS.forEach((market) => {
    const p = project(market.lat, market.lng);
    if (!p.front) return;
    nodes.appendChild(
      el("circle", {
        class: "market-globe__node",
        cx: p.x,
        cy: p.y,
        r: 3.4,
        "data-region": market.region,
        "data-market": market.name,
      })
    );
  });
  svg.appendChild(nodes);
}

function trackCards(section) {
  const cards = [...section.querySelectorAll(".market-card")];
  const nodes = [...section.querySelectorAll(".market-globe__node")];
  const fine = window.matchMedia(mq.finePointer);

  const setRegion = (region) => {
    nodes.forEach((node) => {
      node.classList.toggle("is-on", Boolean(region) && node.dataset.region === region);
    });
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      card.classList.add("is-hot");
      setRegion(card.dataset.region);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-hot");
      setRegion(null);
    });

    if (!fine.matches) return;

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const box = card.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 100;
      const y = ((event.clientY - box.top) / box.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}

export function initMarkets() {
  const section = document.querySelector("#markets");
  const svg = section?.querySelector("#markets-globe");
  if (!section || !svg) return;

  drawGlobe(svg);
  trackCards(section);

  const comet = svg.querySelector(".market-globe__comet");
  const cards = section.querySelectorAll(".market-card");
  const globe = section.querySelector(".markets__globe");

  if (prefersReducedMotion()) return;

  if (comet) {
    gsap.to(comet, {
      strokeDashoffset: -260,
      duration: 16,
      repeat: -1,
      ease: "none",
    });
  }

  gsap.from(globe, {
    y: 28,
    autoAlpha: 0,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: section, start: "top 78%" },
  });

  gsap.from(cards, {
    y: 26,
    autoAlpha: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: section, start: "top 72%" },
  });
}

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

function pinIcon(x, y) {
  const mark = el("g", {
    class: "market-globe__mark",
    transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
  });
  mark.appendChild(el("path", {
    class: "market-globe__mark-body",
    d: "M0 0C0 0-7.6-10.2-7.6-16.8a7.6 7.6 0 1 1 15.2 0C7.6-10.2 0 0 0 0Z",
  }));
  mark.appendChild(el("path", {
    class: "market-globe__mark-check",
    d: "M-3.1-16.8 -0.5-14.3 4.1-18.8",
  }));
  return mark;
}

function pinPoint(pin) {
  return {
    x: Number(pin.dataset.x),
    y: Number(pin.dataset.y),
  };
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
    <filter id="market-pin-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
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

  const nodes = el("g", { class: "market-globe__pins" });
  MARKETS.forEach((market) => {
    const p = project(market.lat, market.lng);
    if (!p.front) return;

    const dx = p.x - CX;
    const dy = p.y - CY;
    const len = Math.hypot(dx, dy) || 1;
    const lx = p.x + (dx / len) * 22;
    const ly = p.y + (dy / len) * 16;
    const anchor = dx >= 0 ? "start" : "end";

    const pin = el("g", {
      class: "market-globe__pin",
      "data-region": market.region,
      "data-market": market.name,
      "data-x": String(p.x),
      "data-y": String(p.y),
    });
    pin.appendChild(el("circle", { class: "market-globe__pulse", cx: p.x, cy: p.y, r: 8 }));
    pin.appendChild(el("line", {
      class: "market-globe__stem",
      x1: p.x,
      y1: p.y,
      x2: lx,
      y2: ly,
    }));
    pin.appendChild(pinIcon(p.x, p.y));
    const label = el("text", {
      class: "market-globe__label",
      x: lx,
      y: ly,
      "text-anchor": anchor,
      dy: "0.32em",
    });
    label.textContent = market.name;
    pin.appendChild(label);
    nodes.appendChild(pin);
  });
  svg.appendChild(nodes);
}

function wrapAngle(angle) {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function layoutLabels(pins) {
  if (!pins.length) return;

  const charW = pins.length > 6 ? 6.1 : 6.6;
  const items = pins.map((pin) => {
    const { x: nx, y: ny } = pinPoint(pin);
    const name = pin.dataset.market || "";
    const near = pins.filter((other) => {
      if (other === pin) return false;
      const p = pinPoint(other);
      return Math.hypot(p.x - nx, p.y - ny) < 36;
    }).length;

    return {
      pin,
      nx,
      ny,
      name,
      angle: Math.atan2(ny - CY, nx - CX),
      r: RADIUS + 24 + near * 12,
      w: Math.max(40, name.length * charW + 6),
      h: 15,
    };
  });

  const place = (item) => {
    const x = CX + Math.cos(item.angle) * item.r;
    const y = CY + Math.sin(item.angle) * item.r;
    const right = Math.cos(item.angle) >= -0.08;
    return {
      x,
      y,
      anchor: right ? "start" : "end",
      x0: right ? x + 3 : x - 3 - item.w,
      y0: y - item.h / 2,
    };
  };

  const overlap = (a, b) => {
    const pad = 5;
    return a.x0 < b.x0 + b.w + pad && a.x0 + a.w + pad > b.x0 && a.y0 < b.y0 + b.h + pad && a.y0 + a.h + pad > b.y0;
  };

  for (let iter = 0; iter < 48; iter += 1) {
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i];
        const b = items[j];
        const A = { ...place(a), w: a.w, h: a.h };
        const B = { ...place(b), w: b.w, h: b.h };
        if (!overlap(A, B)) continue;

        let dAng = wrapAngle(a.angle - b.angle);
        if (Math.abs(dAng) < 0.02) dAng = i % 2 === 0 ? 0.08 : -0.08;
        const push = 0.028 + (iter > 16 ? 0.012 : 0);
        a.angle = wrapAngle(a.angle + Math.sign(dAng) * push);
        b.angle = wrapAngle(b.angle - Math.sign(dAng) * push);

        if (iter > 10) {
          a.r = Math.min(RADIUS + 64, a.r + 0.9);
          b.r = Math.min(RADIUS + 64, b.r + 0.45);
        }
      }
    }
  }

  items.forEach((item) => {
    const pos = place(item);
    const label = item.pin.querySelector(".market-globe__label");
    const stem = item.pin.querySelector(".market-globe__stem");
    label.setAttribute("x", String(pos.x));
    label.setAttribute("y", String(pos.y));
    label.setAttribute("text-anchor", pos.anchor);
    stem.setAttribute("x2", String(pos.x));
    stem.setAttribute("y2", String(pos.y));
  });
}

function trackCards(section) {
  const globe = section.querySelector(".markets__globe");
  const cards = [...section.querySelectorAll(".market-card")];
  const pins = [...section.querySelectorAll(".market-globe__pin")];
  const fine = window.matchMedia(mq.finePointer);

  const setRegion = (region) => {
    globe.classList.toggle("is-focused", Boolean(region));
    const visible = [];
    pins.forEach((pin) => {
      const show = !region || pin.dataset.region === region;
      pin.classList.toggle("is-on", Boolean(region) && show);
      pin.classList.toggle("is-hidden", Boolean(region) && !show);
      if (show) visible.push(pin);
    });
    layoutLabels(visible);
  };

  layoutLabels(pins);

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

  const cards = section.querySelectorAll(".market-card");
  const globe = section.querySelector(".markets__globe");

  if (prefersReducedMotion()) return;

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

import gsap from "gsap";
import * as THREE from "three";
import { MARKETS, MARKET_REGIONS, prefersReducedMotion, mq } from "../config.js";
import { drawLand } from "../globe/land.js";

const GLOBE_RADIUS = 1.72;
const DEG = Math.PI / 180;

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function lookQuat(lat, lng) {
  const from = latLngToVector3(lat, lng, 1).normalize();
  return new THREE.Quaternion().setFromUnitVectors(from, new THREE.Vector3(0, 0, 1));
}

function makeGlobeTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const fill = ctx.createLinearGradient(0, 0, 0, height);
  fill.addColorStop(0, "#0a1824");
  fill.addColorStop(0.5, "#07141d");
  fill.addColorStop(1, "#0a1824");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(0, 174, 239, 0.07)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 12; i += 1) {
    const y = (i / 12) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let i = 1; i < 24; i += 1) {
    const x = (i / 24) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  drawLand(ctx, width, height, "rgba(0, 174, 239, 0.22)", "rgba(127, 227, 255, 0.38)");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function sampleLandDots(count) {
  const width = 720;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  drawLand(ctx, width, height, "#fff", null);
  const data = ctx.getImageData(0, 0, width, height).data;

  const positions = [];
  const colors = [];
  const cyan = new THREE.Color("#7fe3ff");
  const deep = new THREE.Color("#156082");
  let guard = 0;

  while (positions.length / 3 < count && guard < count * 18) {
    guard += 1;
    const u = Math.random();
    const v = Math.random();
    const lat = 90 - v * 180;
    if (Math.random() > Math.cos(lat * DEG)) continue;
    const x = Math.min(width - 1, Math.floor(u * width));
    const y = Math.min(height - 1, Math.floor(v * height));
    if (data[(y * width + x) * 4] < 16) continue;

    const lng = u * 360 - 180;
    const p = latLngToVector3(lat, lng, GLOBE_RADIUS + 0.012);
    positions.push(p.x, p.y, p.z);
    const c = deep.clone().lerp(cyan, 0.45 + Math.random() * 0.55);
    colors.push(c.r, c.g, c.b);
  }

  return { positions, colors };
}

function makeStars(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 4.4 + Math.random() * 3.2;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xb7e9ff,
      size: 0.018,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
}

function makeAtmosphere() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.16, 64, 64),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uColor: { value: new THREE.Color("#00aeef") },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
          float f = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(uColor, 1.0) * f * 1.55;
        }
      `,
    })
  );
}

function makePin(market) {
  const group = new THREE.Group();
  const pos = latLngToVector3(market.lat, market.lng, GLOBE_RADIUS);
  group.position.copy(pos);
  group.lookAt(0, 0, 0);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00aeef, transparent: true, opacity: 0.95 })
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x7fe3ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.0018, 0.42, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x00aeef,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  beam.position.z = 0.28;
  beam.rotation.x = Math.PI / 2;

  group.add(core, halo, beam);
  group.userData = { market, core, halo, beam };
  return group;
}

function makeArc(a, b) {
  const start = latLngToVector3(a.lat, a.lng, GLOBE_RADIUS + 0.02);
  const end = latLngToVector3(b.lat, b.lng, GLOBE_RADIUS + 0.02);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const lift = 1.18 + start.distanceTo(end) * 0.12;
  mid.normalize().multiplyScalar(GLOBE_RADIUS * lift);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
  const mat = new THREE.LineBasicMaterial({
    color: 0x7fe3ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geo, mat);
  line.userData.mat = mat;
  return line;
}

function centroid(markers) {
  if (!markers.length) return { lat: 20, lng: 50 };
  return {
    lat: markers.reduce((s, m) => s + m.lat, 0) / markers.length,
    lng: markers.reduce((s, m) => s + m.lng, 0) / markers.length,
  };
}

export function createMarketGlobe(root) {
  if (!root) return null;

  const canvas = root.querySelector(".market-globe__webgl");
  const labelLayer = root.querySelector(".market-globe__labels");
  if (!canvas) return null;

  const reduce = prefersReducedMotion();
  const mobile = window.matchMedia(mq.mobile).matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0.04, 7.25);

  scene.add(new THREE.AmbientLight(0x6aa0b8, 0.55));
  const key = new THREE.DirectionalLight(0x9adfff, 1.15);
  key.position.set(3.2, 2.2, 4.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x00aeef, 0.55);
  rim.position.set(-3.4, -1.2, -2.2);
  scene.add(rim);

  const stars = makeStars(mobile ? 160 : 280);
  scene.add(stars);

  const pivot = new THREE.Group();
  const earth = new THREE.Group();
  pivot.add(earth);
  scene.add(pivot);

  const globeMap = makeGlobeTexture();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 96, 64),
    new THREE.MeshStandardMaterial({
      map: globeMap,
      roughness: 0.72,
      metalness: 0.18,
      emissive: new THREE.Color("#00aeef"),
      emissiveIntensity: 0.08,
      emissiveMap: globeMap,
    })
  );
  earth.add(sphere);

  const rings = new THREE.Mesh(
    new THREE.TorusGeometry(GLOBE_RADIUS + 0.02, 0.004, 8, 128),
    new THREE.MeshBasicMaterial({
      color: 0x00aeef,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  rings.rotation.x = Math.PI / 2;
  earth.add(rings);

  const tiltRing = rings.clone();
  tiltRing.rotation.x = Math.PI / 3.2;
  tiltRing.rotation.y = 0.4;
  tiltRing.material = tiltRing.material.clone();
  tiltRing.material.opacity = 0.12;
  earth.add(tiltRing);

  const dots = sampleLandDots(mobile ? 1100 : 2100);
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dots.positions, 3));
  dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(dots.colors, 3));
  earth.add(
    new THREE.Points(
      dotGeo,
      new THREE.PointsMaterial({
        size: 0.018,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    )
  );

  earth.add(makeAtmosphere());

  const pins = MARKETS.map((market) => {
    const pin = makePin(market);
    earth.add(pin);
    return pin;
  });

  const arcGroup = new THREE.Group();
  earth.add(arcGroup);

  const labels = MARKETS.map((market) => {
    const el = document.createElement("span");
    el.className = "market-globe__label";
    el.textContent = market.name;
    labelLayer?.append(el);
    return { market, el };
  });

  const look = { lat: MARKET_REGIONS.Europe.lat, lng: MARKET_REGIONS.Europe.lng };
  earth.quaternion.copy(lookQuat(look.lat, look.lng));

  let activeRegion = "Europe";
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let idle = 0;
  let visible = false;
  let raf = 0;
  let lookTween;
  const worldPos = new THREE.Vector3();

  const setSize = () => {
    const { clientWidth, clientHeight } = root;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.position.z = clientWidth < 768 ? 7.85 : 7.25;
    camera.updateProjectionMatrix();
  };

  const setRegion = (region, { animate = true } = {}) => {
    activeRegion = region;
    const regionMarkets = MARKETS.filter((m) => m.region === region);
    const focus = MARKET_REGIONS[region] || centroid(regionMarkets);

    pins.forEach((pin) => {
      const on = pin.userData.market.region === region;
      pin.userData.core.material.color.set(on ? 0x7fe3ff : 0x1caae2);
      pin.userData.halo.material.opacity = on ? 0.38 : 0.1;
      pin.userData.beam.material.opacity = on ? 0.7 : 0.12;
      pin.scale.setScalar(on ? 1.15 : 0.72);
    });

    while (arcGroup.children.length) {
      const line = arcGroup.children[0];
      arcGroup.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    for (let i = 0; i < regionMarkets.length; i += 1) {
      const next = regionMarkets[(i + 1) % regionMarkets.length];
      if (regionMarkets.length === 1) break;
      if (regionMarkets.length === 2 && i === 1) break;
      const arc = makeArc(regionMarkets[i], next);
      arcGroup.add(arc);
      gsap.to(arc.userData.mat, { opacity: reduce ? 0.55 : 0.7, duration: reduce ? 0 : 0.7, delay: 0.12 * i });
    }

    lookTween?.kill();
    const applyLook = () => earth.quaternion.copy(lookQuat(look.lat, look.lng));
    if (!animate || reduce) {
      look.lat = focus.lat;
      look.lng = focus.lng;
      applyLook();
    } else {
      lookTween = gsap.to(look, {
        lat: focus.lat,
        lng: focus.lng,
        duration: 1.45,
        ease: "power3.inOut",
        onUpdate: applyLook,
      });
      gsap.to(pivot.rotation, { x: 0, duration: 1.1, ease: "power3.out" });
    }
  };

  const projectLabels = () => {
    if (!labelLayer) return;
    const w = root.clientWidth;
    const h = root.clientHeight;
    labels.forEach(({ market, el }) => {
      const on = market.region === activeRegion;
      const pin = pins.find((p) => p.userData.market === market);
      pin.getWorldPosition(worldPos);
      const facing = worldPos.z > 0.35;
      worldPos.project(camera);
      const show = on && facing && worldPos.z < 1;
      el.classList.toggle("is-on", show);
      if (!show) return;
      const x = (worldPos.x * 0.5 + 0.5) * w;
      const y = (-worldPos.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const render = (time) => {
    if (!visible) return;
    const t = time * 0.001;
    if (!dragging && !reduce) {
      pivot.rotation.y += velY;
      pivot.rotation.x = Math.max(-0.85, Math.min(0.85, pivot.rotation.x + velX));
      velY *= 0.94;
      velX *= 0.94;
      if (Math.abs(velY) < 0.00012) velY = 0;
      if (Math.abs(velX) < 0.00012) velX = 0;
      idle += 1;
      if (idle > 90 && velY === 0) pivot.rotation.y += 0.00115;
    }
    if (!reduce) {
      stars.rotation.y = t * 0.012;
      tiltRing.rotation.z = t * 0.08;
    }
    pins.forEach((pin) => {
      const on = pin.userData.market.region === activeRegion;
      if (!on || reduce) return;
      const s = 1.12 + Math.sin(t * 3.2) * 0.08;
      pin.userData.halo.scale.setScalar(s);
    });
    renderer.render(scene, camera);
    projectLabels();
    raf = requestAnimationFrame(render);
  };

  const start = () => {
    if (visible) return;
    visible = true;
    setSize();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  };

  const stop = () => {
    visible = false;
    cancelAnimationFrame(raf);
  };

  let velY = 0;
  let velX = 0;

  const onPointerDown = (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    idle = 0;
    velX = 0;
    velY = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    root.classList.add("is-grabbing");
    try {
      root.setPointerCapture(event.pointerId);
    } catch {
      /* capture is optional */
    }
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    velY = dx * 0.0064;
    velX = dy * 0.0042;
    pivot.rotation.y += velY;
    pivot.rotation.x = Math.max(-0.85, Math.min(0.85, pivot.rotation.x + velX));
    idle = 0;
  };

  const onPointerUp = (event) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-grabbing");
    try {
      root.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
  };

  const onContextMenu = (event) => event.preventDefault();

  root.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  root.addEventListener("contextmenu", onContextMenu);

  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) start();
      else stop();
    },
    { threshold: 0.12 }
  );
  io.observe(root);

  const ro = new ResizeObserver(setSize);
  ro.observe(root);

  setRegion(activeRegion, { animate: false });
  setSize();
  start();

  return {
    focusRegion(region) {
      if (region === activeRegion) return;
      idle = 0;
      setRegion(region, { animate: true });
    },
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("contextmenu", onContextMenu);
      renderer.dispose();
    },
  };
}

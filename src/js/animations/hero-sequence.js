import { SITE_CONFIG } from "../config.js";

function pad(n, width) {
  return String(n).padStart(width, "0");
}

function frameUrl(seq, index) {
  return `${seq.dir}${seq.prefix}${pad(index, seq.pad)}.${seq.ext}`;
}

async function loadImage(src) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode().catch(() => {
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  });
  return img;
}

/**
 * Draw one mountain still as a camera descent:
 * progress 0 = top of image (summit)
 * progress 1 = bottom of image (lower terrain)
 */
function drawDescent(ctx, img, w, h, progress, descent = {}) {
  if (!img?.width || !w || !h) return;
  const extraHeight = descent.extraHeight ?? 1.8;
  const bottomCrop = descent.bottomCrop ?? 0;
  const maxPan = descent.maxPan ?? 1;
  const zoom = descent.zoom ?? 1;

  const cover = Math.max(w / img.width, h / img.height) * zoom;
  const minH = h * extraHeight;
  const scale = Math.max(cover, minH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (w - dw) / 2;
  const maxPanDist = Math.max(0, dh - h);
  const dy = -maxPanDist * maxPan * progress - bottomCrop * h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawCover(ctx, img, w, h) {
  if (!img?.width || !w || !h) return;
  const ratio = Math.max(w / img.width, h / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function createHeroRenderer(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const seq = SITE_CONFIG.hero.sequence;
  const descent = SITE_CONFIG.hero.descent ?? {};
  const frames = [];
  let still = null;
  let mode = seq.count > 0 ? "sequence" : "descent";
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastFrame = -1;
  let lastProgress = -1;
  let rafQueued = false;
  let pendingProgress = 0;
  let ready = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, SITE_CONFIG.hero.dprMax);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    lastFrame = -1;
    lastProgress = -1;
    render(pendingProgress);
  }

  function renderSequence(progress) {
    const max = frames.length - 1;
    if (max < 0) return;
    const idx = Math.round(progress * max);
    const img = frames[idx] || frames.find(Boolean);
    if (!img) return;
    if (idx === lastFrame) return;
    lastFrame = idx;
    ctx.fillStyle = "#050b12";
    ctx.fillRect(0, 0, width, height);
    drawCover(ctx, img, width, height);
  }

  function renderDescent(progress) {
    if (!still) return;
    if (Math.abs(progress - lastProgress) < 0.0005 && lastProgress >= 0) return;
    lastProgress = progress;
    ctx.fillStyle = "#050b12";
    ctx.fillRect(0, 0, width, height);
    drawDescent(ctx, still, width, height, progress, descent);
  }

  function render(progress) {
    pendingProgress = progress;
    if (!ready || !width) return;
    if (mode === "sequence") renderSequence(progress);
    else renderDescent(progress);
  }

  function schedule(progress) {
    pendingProgress = progress;
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      render(pendingProgress);
    });
  }

  async function loadDescent() {
    still = await loadImage(SITE_CONFIG.hero.image);
    ready = true;
    resize();
  }

  async function loadSequence() {
    const total = seq.count;
    const preload = Math.min(SITE_CONFIG.hero.preloadCount, total);
    const start = seq.start;

    const loadAt = async (i) => {
      try {
        frames[i] = await loadImage(frameUrl(seq, start + i));
      } catch {
        frames[i] = null;
      }
    };

    await Promise.all(Array.from({ length: preload }, (_, i) => loadAt(i)));
    if (frames.some(Boolean)) {
      ready = true;
      resize();
    }

    const rest = [];
    for (let i = preload; i < total; i += 1) rest.push(i);
    const run = async () => {
      const batch = rest.splice(0, 6);
      if (!batch.length) return;
      await Promise.all(batch.map(loadAt));
      lastFrame = -1;
      render(pendingProgress);
      if (rest.length) requestIdleCallback?.(run) ?? setTimeout(run, 40);
    };
    run();
  }

  async function probeSequence() {
    if (seq.count > 0) {
      try {
        await loadImage(frameUrl(seq, seq.start));
        mode = "sequence";
        frames.length = seq.count;
        await loadSequence();
        return;
      } catch {
        mode = "descent";
      }
    }
    mode = "descent";
    await loadDescent();
  }

  return {
    get mode() {
      return mode;
    },
    get ready() {
      return ready;
    },
    init: probeSequence,
    resize,
    render: schedule,
    destroy() {
      window.removeEventListener("resize", resize);
    },
  };
}

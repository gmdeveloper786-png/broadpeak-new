# BroadPeak International — Landing Page

Premium single-page corporate site for BroadPeak International. Vanilla HTML, CSS, and ES modules, animated with GSAP + ScrollTrigger and smoothed with Lenis.

## Technology stack

- Vite
- GSAP 3 + ScrollTrigger + ScrollToPlugin
- Lenis
- No React, Vue, Angular, jQuery, Bootstrap, or Tailwind

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the local URL Vite prints (default `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

Output is written to `dist/`.

## Asset structure

```text
public/assets/
  brand/          Logo, favicon, brand marks
  hero/
    poster.webp   Critical preload image
    sequence/     Optional camera-descent frames
  mountains/      Fallback descent stills
  vendors/        Partner logos extracted from the company profile
  maps/           Market silhouettes from the company profile
  icons/          Domain, difference, value, and consultancy icons
```

## Hero image sequence

The hero renderer prefers a genuine frame sequence when present.

**Folder:** `public/assets/hero/sequence/`

**Naming:**

```text
frame-0001.webp
frame-0002.webp
frame-0003.webp
...
```

**Specification:**

- WebP or AVIF
- Consistent dimensions across the set
- Sequential zero-padded filenames (`pad: 4`)
- Visual order: summit → ridge → mountain face → lower terrain
- Optional smaller mobile set can be added later via `SITE_CONFIG.hero.sequence`

Then set the frame count in `src/js/config.js`:

```js
hero: {
  sequenceFrames: 120,
  sequence: {
    dir: "/assets/hero/sequence/",
    prefix: "frame-",
    pad: 4,
    ext: "webp",
    start: 1,
    count: 120,
  }
}
```

No architectural rewrite is required. The canvas already cover-fits frames (`object-fit: cover` equivalent) and maps ScrollTrigger progress `0 → 1` to first → last frame.

If `count` is `0` or the first frame cannot be loaded, the site uses the multi-still fallback (cross-dissolve, scale, and vertical translation across four mountain photographs).

## Altitude mapping

Summit altitude is confirmed from the company profile: **8,051 m**.

The company profile does **not** provide a verified base elevation. The counter is experiential below the summit.

```js
// src/js/config.js
summitAltitude: 8051,
endAltitude: 0,
```

Progress mapping:

```text
altitude = round(summitAltitude + (endAltitude - summitAltitude) * progress)
```

Replace `endAltitude` when a verified value is available. Do not present `0 m` as a geographic fact.

## Animation architecture

`src/js/main.js` registers ScrollTrigger once, then boots:

```text
initHeader
initHero
initAbout
initMarkets
initSolutions
initNetwork
initDifference
initValueProposition
initProcess
initConsultancy
initCTA
```

Lenis is synchronized with ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` and `gsap.ticker`.

Responsive and reduced-motion branches use `gsap.matchMedia()`.

## Reduced-motion behavior

When `prefers-reduced-motion: reduce`:

- Lenis is not started
- The hero is not pinned as a long cinematic sequence
- Phases remain readable immediately
- Infinite marquee motion is disabled
- Content meaning is unchanged

## Brand source

Copy, statistics, markets, solution domains, consultancy offerings, and vendor logos are taken from `BroadPeak Company Profile - v7.pptx`.

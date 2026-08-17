/**
 * Central site and motion configuration.
 * Replace END_ALTITUDE when a verified base elevation is available.
 */
export const SITE_CONFIG = {
  name: "BroadPeak International",
  url: "https://www.broadpeak-intl.com",
  canonical: "https://www.broadpeak-intl.com/",
  summitAltitude: 8051,
  endAltitude: 0,
  mountain: {
    name: "Broad Peak",
    range: "Karakoram",
  },
  hero: {
    desktopScrollDistance: 5.25,
    mobileScrollDistance: 3.25,
    sequenceFrames: 0,
    sequence: {
      dir: "/assets/hero/sequence/",
      prefix: "frame-",
      pad: 4,
      ext: "webp",
      start: 1,
      count: 0,
    },
    image: "/assets/mountains/summit.webp",
    descent: {
      extraHeight: 2.7,
    },
    preloadCount: 8,
    dprMax: 2,
  },
  reducedMotion: false,
};

export const MARKETS = [
  { name: "United Kingdom", region: "Europe", lat: 51.51, lng: -0.13, slug: "united-kingdom" },
  { name: "UAE", region: "Middle East", lat: 24.45, lng: 54.38, slug: "uae" },
  { name: "Oman", region: "Middle East", lat: 23.59, lng: 58.38, slug: "oman" },
  { name: "Afghanistan", region: "Middle East", lat: 34.53, lng: 69.17, slug: "afghanistan" },
  { name: "Pakistan", region: "South Asia", lat: 33.68, lng: 73.05, slug: "pakistan" },
  { name: "Bangladesh", region: "South Asia", lat: 23.81, lng: 90.41, slug: "bangladesh" },
  { name: "Sri Lanka", region: "South Asia", lat: 6.93, lng: 79.85, slug: "sri-lanka" },
  { name: "Nepal", region: "South Asia", lat: 27.72, lng: 85.32, slug: "nepal" },
  { name: "Bhutan", region: "South Asia", lat: 27.47, lng: 89.64, slug: "bhutan" },
  { name: "Cambodia", region: "East Asia", lat: 11.56, lng: 104.93, slug: "cambodia" },
  { name: "Myanmar", region: "East Asia", lat: 19.76, lng: 96.08, slug: "myanmar" },
  { name: "Laos", region: "East Asia", lat: 17.97, lng: 102.6, slug: "laos" },
  { name: "Mongolia", region: "East Asia", lat: 47.92, lng: 106.92, slug: "mongolia" },
];

export const VENDORS = [
  { name: "VMware by Broadcom", file: "vendor-vmware.png" },
  { name: "Huawei", file: "vendor-huawei.png" },
  { name: "Lenovo", file: "vendor-lenovo.png" },
  { name: "H3C", file: "vendor-h3c.png" },
  { name: "Eaton", file: "vendor-eaton.png" },
  { name: "StormWall", file: "vendor-stormwall.png" },
  { name: "Vinchin", file: "vendor-vinchin.png" },
  { name: "Digifort", file: "vendor-digifort.png" },
  { name: "Ceburu", file: "vendor-ceburu.png" },
  { name: "ZEROWL", file: "vendor-zerowl.png" },
  { name: "NEXAVM", file: "vendor-nexavm.png" },
  { name: "Foredge", file: "vendor-foredge.png" },
  { name: "wanclouds", file: "vendor-wanclouds.png" },
];

export const mq = {
  desktop: "(min-width: 1024px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  mobile: "(max-width: 767px)",
  reduce: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
};

export function formatAltitude(meters) {
  return `${meters.toLocaleString("en-US")} m`;
}

export function prefersReducedMotion() {
  return window.matchMedia(mq.reduce).matches;
}

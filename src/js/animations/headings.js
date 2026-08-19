import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

function splitWords(el) {
  if (el.dataset.split === "words") {
    return [...el.querySelectorAll(".reveal-word")];
  }

  const text = el.textContent.trim().replace(/\s+/g, " ");
  el.setAttribute("aria-label", text);
  el.textContent = "";
  el.dataset.split = "words";

  const words = text.split(" ");
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "reveal-word";
    span.textContent = word;
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });

  return [...el.querySelectorAll(".reveal-word")];
}

export function initHeadingReveal() {
    const headings = gsap.utils.toArray("main h2.display").filter(
      (heading) => !heading.closest("#consultancy, #difference, #value, #markets, #process")
    );
  if (!headings.length) return;

  headings.forEach((heading) => {
    const words = splitWords(heading);
    if (!words.length) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { color: "var(--text-primary)" });
      return;
    }

    gsap.set(words, { color: "rgba(243, 246, 249, 0.16)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        end: () => `+=${Math.max(260, words.length * 32)}`,
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    });

    tl.to(words, {
      color: "#f3f6f9",
      stagger: 0.14,
      duration: 0.45,
      ease: "none",
    });
  });
}

import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

export function initValueProposition() {
  const section = document.querySelector("#value");
  const pin = section?.querySelector(".value__pin");
  const venn = section?.querySelector(".value-venn");
  if (!section || !pin || !venn) return;

  const stage = section.querySelector(".value__stage");
  const left = section.querySelector(".value-circle--left");
  const right = section.querySelector(".value-circle--right");
  const titles = section.querySelectorAll(".value-circle p");
  const core = section.querySelector(".value-core");
  const notes = gsap.utils.toArray(section.querySelectorAll(".value-note"));
  const links = section.querySelector(".value-links");
  const notesWrap = gsap.utils.toArray(section.querySelectorAll(".value-notes"));
  const leftNotes = gsap.utils.toArray(section.querySelectorAll(".value-notes--left .value-note"));
  const rightNotes = gsap.utils.toArray(section.querySelectorAll(".value-notes--right .value-note"));
  const leftGroup = section.querySelector(".value-links--left");
  const rightGroup = section.querySelector(".value-links--right");

  const toCenter = () => (venn.offsetWidth - left.offsetWidth) / 2;

  const layoutSpokes = () => {
    if (!stage || !links || stage.clientWidth < 10) return;

    const w = stage.clientWidth;
    const h = stage.clientHeight;
    links.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const stageRect = stage.getBoundingClientRect();
    const vennRect = venn.getBoundingClientRect();
    const radius = left.offsetWidth / 2;
    const cy = vennRect.top - stageRect.top + venn.offsetHeight / 2;
    const centers = {
      left: { cx: vennRect.left - stageRect.left + radius, cy, r: radius },
      right: {
        cx: vennRect.left - stageRect.left + venn.offsetWidth - radius,
        cy,
        r: radius,
      },
    };

    const paint = (group, noteEls, side) => {
      const { cx, cy: cY, r } = centers[side];
      const paths = group.querySelectorAll(".value-spoke");
      const dots = group.querySelectorAll("circle");

      noteEls.forEach((note, i) => {
        const box = note.getBoundingClientRect();
        const nx =
          (side === "left" ? box.right : box.left) - stageRect.left;
        const ny = box.top + box.height / 2 - stageRect.top;
        const dx = nx - cx;
        const dy = ny - cY;
        const len = Math.hypot(dx, dy) || 1;
        const hx = cx + (dx / len) * r;
        const hy = cY + (dy / len) * r;
        const run = Math.min(52, Math.abs(hx - nx) * 0.38);
        const elbow = side === "left" ? nx + run : nx - run;
        paths[i]?.setAttribute("d", `M ${nx} ${ny} L ${elbow} ${ny} L ${hx} ${hy}`);
        dots[i]?.setAttribute("cx", String(hx));
        dots[i]?.setAttribute("cy", String(hy));
      });
    };

    paint(leftGroup, leftNotes, "left");
    paint(rightGroup, rightNotes, "right");

    gsap.utils.toArray(links.querySelectorAll(".value-spoke")).forEach((spoke) => {
      let length = 0;
      try {
        length = spoke.getTotalLength() || 0;
      } catch {
        length = 0;
      }
      spoke.style.strokeDasharray = `${length}`;
    });
  };

  if (prefersReducedMotion()) {
    layoutSpokes();
    return;
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1100px)", () => {
    gsap.set(venn, { autoAlpha: 1 });
    gsap.set(titles, { opacity: 0 });
    gsap.set([core, notes, notesWrap, links], { autoAlpha: 0 });
    gsap.set(links.querySelectorAll("circle"), { autoAlpha: 0 });
    gsap.set(core, { xPercent: -50, yPercent: -50, scale: 0.65 });
    layoutSpokes();
    gsap.set(links.querySelectorAll(".value-spoke"), {
      strokeDashoffset: (i, el) => {
        try {
          return el.getTotalLength() || 0;
        } catch {
          return 0;
        }
      },
    });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=320%",
        pin,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: layoutSpokes,
      },
    });

    tl.fromTo(
      left,
      {
        x: () => toCenter(),
        y: () => window.innerHeight * 0.78,
        scale: 0.22,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
      },
      { x: () => toCenter(), y: 0, scale: 1.08, autoAlpha: 1, duration: 1.4 },
      0
    );
    tl.to(left, { scale: 1, duration: 0.3 }, 1.4);
    tl.to(left, { x: 0, duration: 0.95 }, 1.75);
    tl.fromTo(
      right,
      {
        x: () => -toCenter(),
        y: 0,
        scale: 1,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
      },
      { x: 0, autoAlpha: 1, duration: 0.95 },
      1.75
    );
    tl.to(titles, { opacity: 1, duration: 0.4 }, 2.55);
    tl.to(core, { autoAlpha: 1, scale: 1, duration: 0.35 }, 2.6);
    tl.to([links, notesWrap], { autoAlpha: 1, duration: 0.25 }, 2.85);
    tl.to(
      links.querySelectorAll(".value-spoke"),
      { strokeDashoffset: 0, duration: 0.7, stagger: 0.07 },
      2.85
    );
    tl.to(links.querySelectorAll("circle"), { autoAlpha: 1, duration: 0.25, stagger: 0.07 }, 3);
    tl.to(notes, { autoAlpha: 1, duration: 0.4, stagger: 0.07 }, 3);
    tl.to({}, { duration: 0.45 });

    layoutSpokes();
  });

  mm.add("(max-width: 1099px)", () => {
    gsap.set(venn, { autoAlpha: 1 });
    gsap.set([left, right, titles, core], { clearProps: "transform,opacity,visibility" });
    gsap.from(section.querySelectorAll(".value-circle, .value-note"), {
      y: 22,
      autoAlpha: 0,
      stagger: 0.06,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
      },
    });
  });
}

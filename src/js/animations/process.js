import gsap from "gsap";
import { prefersReducedMotion } from "../config.js";

const STAGE_COPY = [
  "01 · Onboard",
  "02 · Enable",
  "03 · Generate Demand",
  "04 · Fulfil",
  "05 · Grow",
];

function activateStep(steps, nodes, stage, index) {
  steps.forEach((step, i) => {
    step.classList.toggle("is-active", i === index);
    step.classList.toggle("is-complete", i <= index);
  });
  nodes.forEach((node, i) => {
    node.classList.toggle("is-on", i <= index);
  });
  if (stage) stage.textContent = STAGE_COPY[index] ?? STAGE_COPY[0];
}

function poseLimbs(root, pose) {
  if (!root) return;
  const armBack = root.querySelector(".arm--back");
  const armReach = root.querySelector(".arm--reach");
  const legL = root.querySelector(".leg--l");
  const legR = root.querySelector(".leg--r");

  if (armBack) {
    gsap.set(armBack, {
      x: pose.backX,
      y: pose.backY,
      rotation: pose.backRot,
      transformOrigin: "0px 0px",
    });
  }
  if (armReach) {
    gsap.set(armReach, {
      x: pose.reachX,
      y: pose.reachY,
      rotation: pose.reachRot,
      transformOrigin: "0px 0px",
    });
  }
  if (legL) {
    gsap.set(legL, {
      x: pose.legLX,
      y: pose.legLY,
      rotation: pose.legLRot,
      transformOrigin: "0px 0px",
    });
  }
  if (legR) {
    gsap.set(legR, {
      x: pose.legRX,
      y: pose.legRY,
      rotation: pose.legRRot,
      transformOrigin: "0px 0px",
    });
  }
}

const PARTNER_LIMBS = {
  idle: {
    backX: -7, backY: -36, backRot: 22,
    reachX: 7, reachY: -36, reachRot: -28,
    legLX: -5, legLY: -18, legLRot: 12,
    legRX: 5, legRY: -18, legRRot: -8,
  },
  climb: {
    backX: -7, backY: -36, backRot: 32,
    reachX: 7, reachY: -36, reachRot: -62,
    legLX: -5, legLY: -18, legLRot: 20,
    legRX: 5, legRY: -18, legRRot: -16,
  },
  reach: {
    backX: -7, backY: -36, backRot: 16,
    reachX: 7, reachY: -36, reachRot: -78,
    legLX: -5, legLY: -18, legLRot: 10,
    legRX: 5, legRY: -18, legRRot: -8,
  },
  walk: {
    backX: -7, backY: -36, backRot: 20,
    reachX: 7, reachY: -36, reachRot: -48,
    legLX: -5, legLY: -18, legLRot: 16,
    legRX: 5, legRY: -18, legRRot: -12,
  },
  stand: {
    backX: -7, backY: -36, backRot: 14,
    reachX: 7, reachY: -36, reachRot: -12,
    legLX: -5, legLY: -18, legLRot: 8,
    legRX: 5, legRY: -18, legRRot: -8,
  },
};

const BP_LIMBS = {
  watch: {
    backX: 7, backY: -36, backRot: -18,
    reachX: -7, reachY: -36, reachRot: 38,
    legLX: -5, legLY: -18, legLRot: 8,
    legRX: 5, legRY: -18, legRRot: -10,
  },
  descend: {
    backX: 7, backY: -36, backRot: -24,
    reachX: -7, reachY: -36, reachRot: 52,
    legLX: -5, legLY: -18, legLRot: 16,
    legRX: 5, legRY: -18, legRRot: -14,
  },
  pull: {
    backX: 7, backY: -36, backRot: -12,
    reachX: -7, reachY: -36, reachRot: 72,
    legLX: -5, legLY: -18, legLRot: 10,
    legRX: 5, legRY: -18, legRRot: -8,
  },
  walk: {
    backX: 7, backY: -36, backRot: -16,
    reachX: -7, reachY: -36, reachRot: 44,
    legLX: -5, legLY: -18, legLRot: 14,
    legRX: 5, legRY: -18, legRRot: -12,
  },
  stand: {
    backX: 7, backY: -36, backRot: -14,
    reachX: -7, reachY: -36, reachRot: 14,
    legLX: -5, legLY: -18, legLRot: 8,
    legRX: 5, legRY: -18, legRRot: -8,
  },
};

function tweenLimbs(tl, root, pose, duration, position) {
  if (!root) return;
  const armBack = root.querySelector(".arm--back");
  const armReach = root.querySelector(".arm--reach");
  const legL = root.querySelector(".leg--l");
  const legR = root.querySelector(".leg--r");
  const vars = { duration, transformOrigin: "0px 0px" };

  if (armBack) tl.to(armBack, { x: pose.backX, y: pose.backY, rotation: pose.backRot, ...vars }, position);
  if (armReach) tl.to(armReach, { x: pose.reachX, y: pose.reachY, rotation: pose.reachRot, ...vars }, position);
  if (legL) tl.to(legL, { x: pose.legLX, y: pose.legLY, rotation: pose.legLRot, ...vars }, position);
  if (legR) tl.to(legR, { x: pose.legRX, y: pose.legRY, rotation: pose.legRRot, ...vars }, position);
}

export function initProcess() {
  const section = document.querySelector("#process");
  if (!section) return;

  const pin = section.querySelector(".process__pin");
  const steps = gsap.utils.toArray(section.querySelectorAll(".process-step"));
  const helper = section.querySelector(".climber--helper");
  const client = section.querySelector(".climber--client");
  const join = section.querySelector(".climb-join");
  const aurora = section.querySelector(".climb-aurora");
  const far = section.querySelector(".peak--far");
  const mid = section.querySelector(".peak--mid");
  const route = section.querySelector(".climb-route");
  const nodes = gsap.utils.toArray(section.querySelectorAll(".climb-node"));
  const stage = section.querySelector("[data-process-stage]");

  gsap.set(helper, { x: 528, y: 118, rotation: 12, transformOrigin: "0px -8px" });
  gsap.set(client, { x: 78, y: 398, rotation: -6, transformOrigin: "0px -8px" });
  poseLimbs(helper, BP_LIMBS.watch);
  poseLimbs(client, PARTNER_LIMBS.idle);
  if (join) gsap.set(join, { x: 286, y: 232, opacity: 0, scale: 0.35, transformOrigin: "0px 0px" });
  if (route) {
    const len = route.getTotalLength();
    gsap.set(route, { strokeDasharray: len, strokeDashoffset: prefersReducedMotion() ? 0 : len });
  }
  gsap.set(nodes, { autoAlpha: 1 });
  activateStep(steps, nodes, stage, 0);

  if (prefersReducedMotion()) {
    activateStep(steps, nodes, stage, steps.length - 1);
    gsap.set(helper, { x: 552, y: 98, rotation: 0 });
    gsap.set(client, { x: 518, y: 110, rotation: 0 });
    poseLimbs(helper, BP_LIMBS.stand);
    poseLimbs(client, PARTNER_LIMBS.stand);
    if (join) gsap.set(join, { x: 535, y: 78, opacity: 0.7, scale: 1 });
    gsap.set(nodes, { autoAlpha: 1 });
    return;
  }

  const mm = gsap.matchMedia();

  const buildClimb = (pinned) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: pinned ? "top top" : "top 72%",
        end: pinned ? "+=220%" : "bottom 40%",
        pin: pinned ? pin : false,
        scrub: 0.65,
        anticipatePin: pinned ? 1 : 0,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          document.body.classList.toggle("is-process-active", self.isActive && pinned);
        },
        onUpdate: (self) => {
          const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length + 0.001));
          activateStep(steps, nodes, stage, i);
        },
      },
    });

    if (aurora) tl.fromTo(aurora, { y: 24, scale: 0.82, opacity: 0.45 }, { y: -8, scale: 1.08, opacity: 1, duration: 1 }, 0);
    if (far) tl.fromTo(far, { y: 18 }, { y: -8, duration: 1 }, 0);
    if (mid) tl.fromTo(mid, { y: 28 }, { y: -10, duration: 1 }, 0);
    if (route) tl.to(route, { strokeDashoffset: 0, duration: 1 }, 0);

    // 01 Onboard — partner at the base (0%), BroadPeak waiting at the summit
    tl.to(client, { x: 78, y: 398, rotation: -6, duration: 0.16 }, 0);
    tl.to(helper, { x: 528, y: 118, rotation: 12, duration: 0.16 }, 0);

    // 02 Enable — partner climbs alone toward halfway (~25%)
    tl.to(client, { x: 168, y: 348, rotation: -10, duration: 0.2 }, 0.18);
    tweenLimbs(tl, client, PARTNER_LIMBS.climb, 0.2, 0.18);
    tl.to(helper, { x: 500, y: 148, rotation: 18, duration: 0.2 }, 0.18);
    tweenLimbs(tl, helper, BP_LIMBS.descend, 0.2, 0.18);

    // 03 Generate Demand — meet at ~50%. BroadPeak has come down.
    tl.to(client, { x: 248, y: 268, rotation: -4, duration: 0.2 }, 0.38);
    tl.to(helper, { x: 318, y: 252, rotation: 20, duration: 0.2 }, 0.38);
    tweenLimbs(tl, client, PARTNER_LIMBS.reach, 0.2, 0.38);
    tweenLimbs(tl, helper, BP_LIMBS.pull, 0.2, 0.38);
    if (join) tl.to(join, { x: 286, y: 228, opacity: 0.9, scale: 1, duration: 0.12 }, 0.5);

    // 04 Fulfil — climb the upper half together
    tl.to(client, { x: 378, y: 188, rotation: -2, duration: 0.18 }, 0.58);
    tl.to(helper, { x: 428, y: 172, rotation: 10, duration: 0.18 }, 0.58);
    tweenLimbs(tl, client, PARTNER_LIMBS.walk, 0.18, 0.58);
    tweenLimbs(tl, helper, BP_LIMBS.walk, 0.18, 0.58);
    if (join) tl.to(join, { x: 404, y: 148, opacity: 0.75, scale: 0.9, duration: 0.18 }, 0.58);

    // 05 Grow — BroadPeak takes the partner to the summit
    tl.to(client, { x: 518, y: 110, rotation: 0, duration: 0.22 }, 0.78);
    tl.to(helper, { x: 552, y: 98, rotation: 0, duration: 0.22 }, 0.78);
    tweenLimbs(tl, client, PARTNER_LIMBS.stand, 0.22, 0.78);
    tweenLimbs(tl, helper, BP_LIMBS.stand, 0.22, 0.78);
    if (join) tl.to(join, { x: 535, y: 72, opacity: 0.7, scale: 1.15, duration: 0.22 }, 0.78);

    return () => {
      document.body.classList.remove("is-process-active");
      activateStep(steps, nodes, stage, 0);
    };
  };

  mm.add("(min-width: 1024px)", () => buildClimb(true));
  mm.add("(max-width: 1023px)", () => buildClimb(false));
}

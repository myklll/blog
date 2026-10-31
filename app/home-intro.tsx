"use client";

import { useEffect } from "react";

// Runs in <head> before first paint: on every load of the homepage, flags
// <html data-intro="play"> so CSS hides the page until the intro takes over.
export const homeIntroScript = `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="play"}catch(e){}`;

// rhythm, ms
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const MOVE_EASE = "cubic-bezier(0.75, 0, 0.2, 1)";
const REVEAL = { delay: 100, duration: 650 }; // MICHAEL wipes in
const PHOTO = { delay: 520, duration: 550 }; // photo wipes in after it
const MOVE = { delay: 1250, duration: 850 }; // both glide into place
const LAND = MOVE.delay + MOVE.duration * 0.6; // the rest starts as they settle
const STAGGER = 90;

// Homepage intro: MICHAEL and the photo reveal left to right as a small lockup in the
// middle of the screen, then glide into their real places (FLIP: the real elements are
// transformed, not copies), and the rest of the page rises in behind them.
export function HomeIntro() {
  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "play") return;

    const masthead = document.querySelector<HTMLElement>('[data-intro="masthead"]');
    const photo = document.querySelector<HTMLElement>('[data-intro="photo"]');
    if (!masthead || !photo) return void delete html.dataset.intro;

    scrollTo(0, 0);
    const vw = innerWidth;
    const vh = innerHeight;
    const M = masthead.getBoundingClientRect();
    const P = photo.getBoundingClientRect();

    // the lockup: MICHAEL at ~44% of the viewport width (wider on phones), photo square beside it
    const L = Math.min(vw * (vw < 768 ? 0.6 : 0.44), M.width);
    const s = L / M.width;
    const H = M.height * s; // lockup height = photo square side
    const gap = Math.max(4, H * 0.04);
    const left = (vw - (L + gap + H)) / 2;
    const top = (vh - H) / 2;

    const anims: Animation[] = [];
    const go = (el: Element, k: Keyframe[], o: KeyframeAnimationOptions) =>
      anims.push(el.animate(k, { fill: "both", ...o }));

    // MICHAEL: scaled down in the lockup, wiped in, then home
    masthead.style.transformOrigin = "0 0";
    const mFrom = `translate(${left - M.left}px, ${top - M.top}px) scale(${s})`;
    go(masthead, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], { ...REVEAL, easing: EASE });
    // (it sets off a beat after the photo, so the photo drops clear before MICHAEL grows over it)
    go(masthead, [{ transform: mFrom }, { transform: mFrom }], { duration: MOVE.delay + 100 });
    // (forwards only: before it starts, the hold above owns the transform)
    go(masthead, [{ transform: mFrom }, { transform: "none" }], {
      delay: MOVE.delay + 100,
      duration: MOVE.duration,
      easing: MOVE_EASE,
      fill: "forwards",
    });

    // photo: uniformly scaled so its centred square crop fills the lockup square;
    // the crop wipes open left to right, then widens to the full image as it moves home
    photo.style.transformOrigin = "0 0";
    const ps = Math.max(H / P.width, H / P.height);
    const q = H / ps; // square side in the photo's own pixels
    const cx = (P.width - q) / 2;
    const cy = (P.height - q) / 2;
    const pFrom = `translate(${left + L + gap - P.left - cx * ps}px, ${top - P.top - cy * ps}px) scale(${ps})`;
    const square = `inset(${cy}px ${cx}px ${cy}px ${cx}px)`;
    go(photo, [{ clipPath: `inset(${cy}px ${P.width - cx}px ${cy}px ${cx}px)` }, { clipPath: square }], { ...PHOTO, easing: EASE });
    go(photo, [{ transform: pFrom }, { transform: pFrom }], { duration: MOVE.delay });
    go(photo, [{ transform: pFrom, clipPath: square }, { transform: "none", clipPath: "inset(0px 0px 0px 0px)" }], {
      ...MOVE,
      easing: MOVE_EASE,
      fill: "forwards", // or its first frame would override the wipe above
    });

    // the Latest column wipes down from the top, drawing its rule as it goes
    const column = document.querySelector('[data-intro="column"]');
    if (column)
      go(column, [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], {
        delay: LAND,
        duration: 900,
        easing: EASE,
      });

    // caption lines, then the posts, rise in on a steady beat
    document.querySelectorAll('[data-intro="rise"]').forEach((el, i) =>
      go(el, [{ opacity: 0, transform: "translateY(0.75rem)" }, { opacity: 1, transform: "none" }], {
        delay: LAND + 120 + i * STAGGER,
        duration: 600,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      })
    );

    // the animations now hold the starting frame, so the CSS hiding can go
    html.dataset.intro = "running";

    Promise.all(anims.map(a => a.finished))
      .catch(() => {})
      .then(() => {
        anims.forEach(a => a.cancel());
        masthead.style.transformOrigin = photo.style.transformOrigin = "";
        delete html.dataset.intro;
      });

    return () => anims.forEach(a => a.cancel());
  }, []);

  return null;
}

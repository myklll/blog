"use client";

import { useEffect, type RefObject } from "react";

// A "→" built as a two-fin dart (a second copy at 90°) so it can turn around its own
// shaft and read as a solid object. The shaft sits 0.448em down a 1.05 line box
// (measured), which is both the turn axis and the eye line, so at rest fin B is
// exactly edge-on and invisible. Use with useDarts() on the hover target.
export function Dart({ flip = false }: { flip?: boolean }) {
  return (
    <span data-dart className="inline-block will-change-transform">
      <span
        className={`inline-block [perspective:12em] [perspective-origin:50%_0.448em] ${
          flip ? "-scale-x-100" : ""
        }`}
      >
        <span
          data-rotor
          className="relative inline-block [transform-style:preserve-3d] [transform-origin:50%_0.448em] will-change-transform"
        >
          <span data-fin-a>→</span>
          <span
            data-fin-b
            aria-hidden
            className="absolute inset-0 [transform-origin:50%_0.448em] [transform:rotateX(90deg)]"
          >
            →
          </span>
        </span>
      </span>
    </span>
  );
}

// A Dart that's hidden until its parent `.group` is hovered, then fades and slides in.
// `float` takes it out of the flow (absolutely after the text) so it never shifts layout.
export function HoverDart({ float = false }: { float?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block leading-[1.05] opacity-0 -translate-x-[0.2em] transition-[opacity,transform] duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 ${
        float ? "absolute left-full top-1/2 -translate-y-1/2 ml-[0.25em] text-[0.8em]" : ""
      }`}
    >
      <Dart />
    </span>
  );
}

const SPIN = 120; // degrees per second at full speed (a turn every 3s)

// While `target` is hovered, every <Dart> inside it eases up to speed and drifts by
// `nudge` em (negative = left). `wave` delays each successive dart's turn by that many
// degrees. `travel` slides a [data-travel] strip continuously by `speed` em/s
// (negative = left), and on leave glides it on to the next `cell` boundary. On leave the
// darts keep turning, fall back into step and settle face-on (every 180°) instead of
// freezing mid-turn.
export function useDarts(
  target: RefObject<HTMLElement | null>,
  {
    nudge = 0.15,
    wave = 0,
    travel,
  }: { nudge?: number; wave?: number; travel?: { cell: number; speed: number } } = {}
) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = target.current;
    if (!el) return;
    const darts = [...el.querySelectorAll<HTMLElement>("[data-dart]")].map(d => ({
      d,
      rotor: d.querySelector<HTMLElement>("[data-rotor]")!,
      a: d.querySelector<HTMLElement>("[data-fin-a]")!,
      b: d.querySelector<HTMLElement>("[data-fin-b]")!,
    }));

    let angle = 0;
    let speed = 0;
    let offset = 0;
    let spread = 0; // 1 while hovered (wave on), eases to 0 so the darts realign
    const strip = el.querySelector<HTMLElement>("[data-travel]");
    let pos = 0; // em travelled
    let pace = 0;
    let hovered = false;
    let raf = 0;
    let last = 0;

    const paint = () => {
      if (strip && travel)
        strip.style.transform = `translateX(${Math.sign(travel.speed) * (pos % travel.cell)}em)`;
      darts.forEach(({ d, rotor, a, b }, i) => {
        const deg = angle - i * wave * spread;
        const r = (deg * Math.PI) / 180;
        d.style.transform = `translateX(${offset}em)`;
        rotor.style.transform = `rotateX(${deg}deg)`;
        // each fin is solid ink face-on, fading as it turns edge-on
        a.style.opacity = String(0.3 + 0.7 * Math.abs(Math.cos(r)));
        b.style.opacity = String(0.3 + 0.7 * Math.abs(Math.sin(r)));
      });
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const ease = Math.min(1, dt * 5);
      offset += ((hovered ? nudge : 0) - offset) * ease;
      spread += ((hovered ? 1 : 0) - spread) * ease;
      let travelling = false;
      if (travel) {
        const top = Math.abs(travel.speed);
        if (hovered) {
          pace += (top - pace) * Math.min(1, dt * 3);
          pos += pace * dt;
        } else {
          const left = Math.ceil(pos / travel.cell - 0.0001) * travel.cell - pos;
          pace += (Math.min(top, Math.max(0.15, left * 3)) - pace) * Math.min(1, dt * 6);
          pos += Math.min(left, pace * dt);
          travelling = left > 0.002;
        }
      }
      if (hovered) {
        speed += (SPIN - speed) * Math.min(1, dt * 3);
        angle += speed * dt;
      } else {
        // glide on to the next face-on angle, easing down only as it arrives
        const rest = Math.ceil(angle / 180 - 0.001) * 180;
        const remaining = rest - angle;
        speed += (Math.min(SPIN, Math.max(15, remaining * 3)) - speed) * Math.min(1, dt * 6);
        angle += Math.min(remaining, speed * dt);
        if (rest - angle < 0.05 && Math.abs(offset) < 0.002 && spread < 0.002 && !travelling) {
          angle = speed = offset = spread = pos = pace = 0;
          paint();
          raf = 0;
          return;
        }
      }
      paint();
      raf = requestAnimationFrame(tick);
    };

    const run = (on: boolean) => () => {
      hovered = on;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const enter = run(true);
    const leave = run(false);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, [target, nudge, wave, travel?.cell, travel?.speed]);
}

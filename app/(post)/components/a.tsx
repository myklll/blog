import Link from "next/link";
import type { ReactNode } from "react";

// Body-copy links get a hand-drawn loop around them instead of an underline. The shape is
// seeded from the link itself, so every link is drawn differently but the same link is
// always drawn the same (no hydration mismatch, no reshuffling between visits).
export function A({ children, className = "", href, circle = true, ...props }) {
  const classes = `relative inline-block ${className}`;
  const content = (
    <>
      {children}
      {circle && <Loop seed={`${href}|${textOf(children)}`} />}
    </>
  );

  if (href[0] === "#") {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  } else if (href[0] === "/") {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  } else {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {content}
      </a>
    );
  }
}

// A pen-drawn oval: a little wobbly, starting at a random angle and running ~1.1 turns so
// the end overshoots the start, drifting slightly outward so the overlap doesn't retrace.
function Loop({ seed }: { seed: string }) {
  const rand = mulberry32(hash(seed));
  const start = rand() * Math.PI * 2;
  const sweep = Math.PI * 2 + 0.3 + rand() * 0.5;
  const drift = 0.04 + rand() * 0.05;
  const wobble = [0.02 + rand() * 0.03, 0.01 + rand() * 0.025];
  const phase = [rand() * 6.28, rand() * 6.28];
  const lean = (rand() - 0.5) * 0.12; // a slight slant, as a hand would

  const steps = 56;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const t = start + sweep * k;
    const r = 1 - drift / 2 + drift * k + wobble[0] * Math.sin(2 * t + phase[0]) + wobble[1] * Math.sin(3 * t + phase[1]);
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    points.push([50 + 47 * (x + lean * y), 50 + 44 * y]);
  }

  // smooth through the points with quadratic curves between midpoints
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q${x.toFixed(2)},${y.toFixed(2)} ${((x + nx) / 2).toFixed(2)},${((y + ny) / 2).toFixed(2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += ` L${lx.toFixed(2)},${ly.toFixed(2)}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="loop pointer-events-none absolute -inset-x-[0.45em] -inset-y-[0.3em] w-[calc(100%+0.9em)] h-[calc(100%+0.6em)] overflow-visible"
    >
      {/* pathLength=1 lets CSS redraw it on hover (globals.css: .loop) */}
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="1"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as any).props.children);
  return "";
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

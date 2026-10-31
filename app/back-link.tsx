"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Dart, useDarts } from "./dart";

// A full-width rule of back arrows: the same dart as "Profile →", mirrored. The count and
// spacing are fitted to the column so the first arrow starts flush left and the last ends
// flush right; one extra waits just past the edge to slide in. On hover the row slides
// left by one cell a second while the arrows spin in a wave along it.
// (1.05 line height keeps the shaft where Dart expects it.)
export function BackLink() {
  const link = useRef<HTMLAnchorElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState({ n: 12, cell: 1.5 }); // cell in em

  useLayoutEffect(() => {
    const measure = () => {
      const width = link.current!.clientWidth;
      const em = parseFloat(getComputedStyle(link.current!).fontSize);
      const glyph = probe.current!.getBoundingClientRect().width;
      // as many arrows as fit at ~1.5em pitch, then stretch the pitch to land flush right
      const n = Math.max(2, Math.floor((width - glyph) / (1.5 * em)) + 1);
      const cell = (width - glyph) / (n - 1) / em;
      setFit(f => (f.n === n && Math.abs(f.cell - cell) < 0.001 ? f : { n, cell }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(link.current!);
    return () => ro.disconnect();
  }, []);

  useDarts(link, { nudge: 0, wave: 25, travel: { cell: fit.cell, speed: -1.5 } });

  return (
    <Link
      ref={link}
      href="/"
      aria-label="Back to home"
      className="relative block mb-8 overflow-hidden whitespace-nowrap font-display text-2xl md:text-[2.25rem] leading-[1.05]"
    >
      {/* an unstyled arrow, only to measure the glyph's width */}
      <span ref={probe} aria-hidden className="invisible absolute">
        →
      </span>
      <span aria-hidden data-travel className="flex will-change-transform">
        {Array.from({ length: fit.n + 1 }, (_, i) => (
          <span key={i} className="shrink-0" style={{ width: `${fit.cell}em` }}>
            <Dart flip />
          </span>
        ))}
      </span>
    </Link>
  );
}

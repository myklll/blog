"use client";

import { useRef } from "react";
import { HoverDart, useDarts } from "./dart";

// a footer link: on hover a spinning arrow floats in after the label (out of the flow, so
// the row doesn't reflow) and the label slides left by half the arrow's width, keeping
// label + arrow centred on the label's spot
export function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const link = useRef<HTMLAnchorElement>(null);
  useDarts(link);
  return (
    <a ref={link} href={href} target="_blank" rel="noopener noreferrer" className="group relative">
      <span className="relative inline-block transition-transform duration-300 ease-out group-hover:-translate-x-[0.5em]">
        {children}
        <HoverDart float />
      </span>
    </a>
  );
}

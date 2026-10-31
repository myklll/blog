import type { ReactNode } from "react";

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-6 pl-4 border-l-2 border-ink">
      {children}
    </blockquote>
  );
}

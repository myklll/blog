// The inverted, edge-to-edge wordmark block (MICHAEL on the front page, ABOUT, …).
// `fit` is the font size in % of the container width, so the word spans it exactly:
// fit ≈ 96 / (word's advance width in em), e.g. MICHAEL 2.861em → 33.5, ABOUT 2.392em → 40.
export function Masthead({
  children,
  fit,
  className = "",
  intro,
}: {
  children: React.ReactNode;
  fit: number;
  className?: string;
  // marks the element for the home intro (home-intro.tsx)
  intro?: string;
}) {
  return (
    <div data-intro={intro} className={`[container-type:inline-size] ${className}`}>
      <h1
        className="bg-ink text-paper px-[2cqw] py-[3cqw] font-display uppercase text-center"
        style={{ fontSize: `${fit}cqw` }}
      >
        {/* trim the line box to the glyph ink (measured: 0.672em above, 0.093em below baseline) */}
        <span className="block leading-none mt-[-0.09em] mb-[-0.13em]">{children}</span>
      </h1>
    </div>
  );
}

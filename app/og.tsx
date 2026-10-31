import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Post share cards (Open Graph), in the site's newspaper style: Cravelo display type,
// Geist Serif body, ink on paper. 1200×630. (Home and About use a static scanned photo,
// public/images/og-home.jpg.)

const INK = "#1b1a17";
const PAPER = "#f7f6f2";

const fonts = join(process.cwd(), "fonts");
const cravelo = readFileSync(join(fonts, "Cravelo DEMO.otf"));
// Geist Serif ships as woff2 only, which the image renderer can't read; this is a TTF copy
const geistSerif = readFileSync(join(fonts, "geist-serif-regular.ttf"));

const size = { width: 1200, height: 630 };
const options = {
  ...size,
  fonts: [
    { name: "Cravelo", data: cravelo, weight: 400 as const },
    // listed second so digits and punctuation Cravelo lacks fall back to it
    { name: "Geist Serif", data: geistSerif, weight: 400 as const },
  ],
};

// Cravelo's capitals sit 0.672em above the baseline; trimming the line box to the letters
// (as on the site) needs these margins
const trim = { lineHeight: 1, marginTop: "-0.09em", marginBottom: "-0.13em" };

function Wordmark({ fontSize }: { fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        background: INK,
        color: PAPER,
        padding: `${fontSize * 0.09}px ${fontSize * 0.08}px`,
        fontFamily: "Cravelo",
        fontSize,
      }}
    >
      <div style={{ display: "flex", ...trim }}>MICHAEL</div>
    </div>
  );
}

// a post: masthead strip, the headline, then date and byline between rules
export function postCard({ title, date }: { title: string; date: string }) {
  const long = title.length > 48;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: PAPER, color: INK, padding: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Wordmark fontSize={56} />
          <span style={{ fontFamily: "Geist Serif", fontSize: 26 }}>michaeladeyeri.com</span>
        </div>
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            fontFamily: "Cravelo",
            fontSize: long ? 84 : 104,
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `2px solid ${INK}`,
            borderBottom: `2px solid ${INK}`,
            padding: "14px 0",
            fontFamily: "Geist Serif",
            fontSize: 26,
          }}
        >
          <span>{date}</span>
          <span>By Michael Adeyeri</span>
        </div>
      </div>
    ),
    options
  );
}

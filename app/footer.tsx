import Link from "next/link";
import { Fragment } from "react";
import { ScanlineImage } from "./scanline-image";
import { FooterLink } from "./footer-link";

const links = [
  { label: "X", href: "https://x.com/michael_adeyeri" },
  { label: "Busha", href: "https://busha.co" },
  { label: "NGNb", href: "https://ngnb.co" },
  { label: "Credits", href: "https://madeofwhite.co/" },
];

// `logo` off (the homepage, where MICHAEL is already up top): the links spread edge to edge
export function Footer({ logo = true }: { logo?: boolean }) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 py-6 mt-6 border-t border-ink">
      {/* a small masthead: same inverted MICHAEL block and scanned photo as the front page.
       * the block is 1.02em tall (0.78em trimmed line + 2 × 0.12em padding); the photo matches.
       * sized ~30% over the links' cap height (0.672em): a solid block reads smaller than
       * thin capitals of the same height, so matching them exactly looked undersized */}
      {logo && (
        <div className="flex items-center gap-1 font-display uppercase text-[1.08rem] md:text-[1.3rem]">
          <Link href="/" className="bg-ink text-paper px-[0.15em] py-[0.12em]">
            <span className="block leading-none mt-[-0.09em] mb-[-0.13em]">Michael</span>
          </Link>
          <ScanlineImage
            src="/images/IMG_5105.webp"
            alt="Michael Adeyeri"
            mono
            hoverSelf
            className="w-[1.02em] h-[1.02em] shrink-0"
          />
        </div>
      )}

      <nav
        className={`flex items-center gap-[0.75em] font-display uppercase text-xl md:text-2xl leading-none ${
          logo ? "" : "w-full justify-between"
        }`}
      >
        {links.map((link, i) => (
          <Fragment key={link.href}>
            {i > 0 && <Star />}
            <FooterLink href={link.href}>{link.label}</FooterLink>
          </Fragment>
        ))}
      </nav>
    </footer>
  );
}

// neither Cravelo nor Geist Serif has a star glyph, so it's drawn: a tall four-point
// sparkle with hairline tips; takes the text colour
function Star() {
  return (
    <svg aria-hidden viewBox="0 0 26 40" className="w-[0.36em] h-[0.56em] shrink-0 fill-current">
      <path d="M13 0C13.2 14 14 19 26 20 14 21 13.2 26 13 40 12.8 26 12 21 0 20 12 19 12.8 14 13 0Z" />
    </svg>
  );
}

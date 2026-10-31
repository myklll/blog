import "./globals.css";

import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { GeistSerif } from "geist/font/serif";
import { Analytics } from "./analytics";
import { homeIntroScript } from "./home-intro";

const cravelo = localFont({
  src: "../fonts/Cravelo DEMO.otf",
  variable: "--font-cravelo",
  display: "swap",
  // missing glyphs (digits, punctuation) fall back to Geist Serif via tailwind's font-display stack
  fallback: [],
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"]
});

export const metadata = {
  title: "Michael Adeyeri's blog",
  description:
    "Michael Adeyeri is a software engineer and the CEO of Busha, building a single money app for Africa that brings investing, spending, and financial access into one place.",
  openGraph: {
    title: "Michael Adeyeri's blog",
    description:
      "Michael Adeyeri is a software engineer and the CEO of Busha, building a single money app for Africa that brings investing, spending, and financial access into one place.",
    url: "https://michaeladeyeri.com",
    siteName: "Michael Adeyeri's blog",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@michael_adeyeri",
    creator: "@michael_adeyeri",
  },
  metadataBase: new URL("https://michaeladeyeri.com"),
};

export const viewport = {
  themeColor: "transparent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSerif.variable} ${cravelo.variable} ${geistMono.variable} font-serif antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: homeIntroScript }} />
      </head>
      <body className="px-4 md:px-8">
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}

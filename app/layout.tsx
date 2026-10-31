import "./globals.css";

import type { Metadata, Viewport } from "next";

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

const description =
  "Michael Adeyeri is the CEO of Busha, building a single money app for Africa. Writing on Busha, NGNb and financial infrastructure for Africa.";

export const metadata: Metadata = {
  metadataBase: new URL("https://michaeladeyeri.com"),
  title: {
    default: "Michael Adeyeri: CEO, Busha. Building a single money app for Africa",
    template: "%s | Michael Adeyeri",
  },
  description,
  authors: [{ name: "Michael Adeyeri", url: "https://michaeladeyeri.com" }],
  creator: "Michael Adeyeri",
  alternates: {
    canonical: "/",
    types: { "application/atom+xml": "/atom" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Michael Adeyeri",
    title: "Michael Adeyeri: CEO, Busha. Building a single money app for Africa",
    description,
    images: [{ url: "/images/og-home.jpg", width: 1200, height: 630, alt: "Michael Adeyeri" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@michael_adeyeri",
    creator: "@michael_adeyeri",
    images: ["/images/og-home.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181715" }, // --paper in dark mode
  ],
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

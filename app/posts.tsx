"use client";

import Link from "next/link";
import { useRef } from "react";
import { Dart, HoverDart, useDarts } from "./dart";
import { BrandLogos } from "./brand-logos";
import useSWR from "swr";
import type { Post } from "./get-posts";
import { Footer } from "./footer";
import { ScanlineImage } from "./scanline-image";
import { Masthead } from "./masthead";
import { HomeIntro } from "./home-intro";

const fetcher = (url: string) => fetch(url).then(res => res.json());

// how many stories sit in the "Latest" column before the rest move to the archive
const LATEST_COUNT = 3;

export function Posts({ posts: initialPosts }: { posts: Post[] }) {
  const { data: posts = initialPosts } = useSWR<Post[]>("/api/posts", fetcher, {
    fallbackData: initialPosts,
    refreshInterval: 5000,
  });

  const latest = posts.slice(0, LATEST_COUNT);
  const archive = posts.slice(LATEST_COUNT);

  return (
    // the document is the scroller, so the wheel moves the articles wherever the
    // pointer is; Front is pinned with sticky. On mobile everything stacks.
    <section className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <HomeIntro />
      <Front />

      <div data-intro="column" className="md:min-h-screen md:pl-8 border-t md:border-t-0 md:border-l border-ink">
        <Latest posts={latest} />
        {archive.length > 0 && <Archive posts={archive} />}
        <Footer logo={false} />
      </div>
    </section>
  );
}

function Front() {
  return (
    <div className="flex flex-col pt-4 pb-6 md:pt-6 md:pr-8 md:h-screen md:sticky md:top-0 md:self-start">
      <Masthead fit={33.5} intro="masthead" className="shrink-0">
        Michael
      </Masthead>

      <div className="flex flex-col min-h-0 grow mt-4 md:mt-6">
        {/* desktop: image and caption sit side by side, the image taking the remaining height */}
        <figure className="flex flex-col min-h-0 grow md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6">
          <ScanlineImage
            src="/images/IMG_5105.webp"
            alt="Michael Adeyeri"
            mono
            hoverSelf
            intro="photo"
            className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-0"
          />
          {/* desktop: the profile link drops to the bottom edge of the image; it's the only
           * link here, and the only thing that triggers the arrow spin */}
          <figcaption className="shrink-0 mt-3 md:mt-0 flex flex-col justify-between gap-4 font-display uppercase text-2xl md:text-[2.25rem] leading-[1.05]">
            <span>
              <span data-intro="rise" className="block">Founder &amp; CEO, Busha. Building a single money app for Africa.</span>
              <span data-intro="rise" className="block mt-4 font-serif normal-case text-base md:text-lg leading-relaxed">
                Software engineer. Previously an early employee at Jumia, CTO at
                Surebids, and founder of Formplus and Kraks.
              </span>
            </span>
            {/* bottom row: Busha and NGNb marks on the left, the profile link on the right */}
            <span data-intro="rise" className="flex items-center justify-between gap-4 mt-8 md:mt-0">
              <BrandLogos />
              <ProfileLink />
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

// "Profile →": the arrow spins around its shaft and drifts forward while hovered
function ProfileLink() {
  const link = useRef<HTMLAnchorElement>(null);
  useDarts(link);
  return (
    <Link ref={link} href="/about">
      Profile <Dart />
    </Link>
  );
}

function Latest({ posts }: { posts: Post[] }) {
  return (
    <div>
      {/* equal space above and below the letters: the line box is trimmed to the glyph
       * ink (as in Masthead), so the padding is the only space */}
      <h2 className="font-display uppercase text-center text-6xl md:text-7xl py-6 border-b border-ink">
        <span className="block leading-none mt-[-0.09em] mb-[-0.13em]">Latest</span>
      </h2>

      <ul>
        {posts.map(post => (
          <li key={post.id} data-intro="rise" className="py-6 border-b border-ink last:border-b-0">
            <LatestLink post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// hovering anywhere on the post brings in a spinning arrow after the title's last word
function LatestLink({ post }: { post: Post }) {
  const link = useRef<HTMLAnchorElement>(null);
  useDarts(link);
  return (
    <Link ref={link} href={postHref(post)} className="group block">
      {post.image && <ScanlineImage src={post.image} alt="" className="aspect-[16/9]" />}
      <h3 className="mt-4 font-display uppercase text-2xl md:text-[2.25rem] leading-[1.05]">
        {post.title}
        {/* the no-break space keeps the arrow with the last word */}
        {"\u00a0"}
        <HoverDart />
      </h3>
      <Meta post={post} />
    </Link>
  );
}

function Archive({ posts }: { posts: Post[] }) {
  return (
    <section className="pb-8">
      <h2 className="font-display uppercase text-4xl md:text-5xl leading-none pb-4 border-b border-ink">
        Archive
      </h2>
      <ul>
        {posts.map(post => (
          <li key={post.id} className="border-b border-ink">
            <ArchiveLink post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArchiveLink({ post }: { post: Post }) {
  const link = useRef<HTMLAnchorElement>(null);
  useDarts(link);
  return (
    <Link ref={link} href={postHref(post)} className="group flex items-baseline gap-4 py-4">
      <span className="grow font-display uppercase text-xl md:text-2xl leading-[1.05]">
        {post.title}
        {"\u00a0"}
        <HoverDart />
      </span>
      <span className="shrink-0 text-sm">{post.date}</span>
    </Link>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="mt-2 text-sm">{post.date}</p>
  );
}

function postHref(post: Post) {
  return `/${new Date(post.date).getFullYear()}/${post.id}`;
}

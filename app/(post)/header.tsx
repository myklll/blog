"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import type { Post } from "@/app/get-posts";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Header({ posts }: { posts: Post[] }) {
  const segments = useSelectedLayoutSegments();
  // segments can be:
  // date/post
  // lang/date/post
  const initialPost = posts.find(
    post => post.id === segments[segments.length - 1]
  );
  const { data: post, mutate } = useSWR(
    `/api/view?id=${initialPost?.id ?? ""}`,
    fetcher,
    {
      fallbackData: initialPost,
      refreshInterval: 5000,
    }
  );

  if (initialPost == null) return <></>;

  return (
    <header className="mb-2">
      <h1 className="font-display uppercase text-4xl md:text-6xl leading-[1.05] text-balance">
        {post.title}
      </h1>

      <p className="flex justify-between gap-4 mt-6 py-2 border-y border-ink text-sm">
        <span>{post.date}</span>

        <span>
          By{" "}
          <a
            href="https://x.com/michael_adeyeri"
            className="text-ink hover:underline underline-offset-4"
            target="_blank"
          >
            Michael Adeyeri
          </a>
        </span>

        <LogView id={post.id} mutate={mutate} />
      </p>
    </header>
  );
}

// records the view in redis; counts are no longer shown on the site
function LogView({ id, mutate }) {
  const didLogViewRef = useRef(false);

  useEffect(() => {
    if ("development" === process.env.NODE_ENV) return;
    if (!didLogViewRef.current) {
      const url = "/api/view?incr=1&id=" + encodeURIComponent(id);
      fetch(url)
        .then(res => res.json())
        .then(obj => {
          mutate(obj);
        })
        .catch(console.error);
      didLogViewRef.current = true;
    }
  });

  return null;
}

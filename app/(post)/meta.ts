import type { Metadata } from "next";

// Metadata for a post page: canonical URL, article Open Graph tags and the generated share
// card (/og/[id]), unless the post passes its own image.
export function postMetadata({
  id,
  title,
  description,
  date,
  image,
}: {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: { url: string; width: number; height: number };
}): Metadata {
  const url = `/${new Date(date).getFullYear()}/${id}`;
  const og = image ?? { url: `/og/${id}`, width: 1200, height: 630 };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: new Date(date).toISOString(),
      authors: ["Michael Adeyeri"],
      images: [{ ...og, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og.url] },
  };
}

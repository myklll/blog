import type { MetadataRoute } from "next";
import { getPosts } from "./get-posts";

const site = "https://michaeladeyeri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: site, lastModified: new Date(posts[0]?.date ?? Date.now()) },
    { url: `${site}/about` },
    ...posts.map(post => ({
      url: `${site}/${new Date(post.date).getFullYear()}/${post.id}`,
      lastModified: new Date(post.date),
    })),
  ];
}

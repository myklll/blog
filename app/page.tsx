import { Posts } from "./posts";
import { getPosts } from "./get-posts";

export const revalidate = 300;

export default async function Home() {
  const posts = await getPosts();
  return (
    <>
      {/* structured data so search engines know who the site is about */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <Posts posts={posts} />
    </>
  );
}

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Michael Adeyeri",
  url: "https://michaeladeyeri.com",
  image: "https://michaeladeyeri.com/images/og-portrait.jpg",
  jobTitle: "CEO",
  worksFor: { "@type": "Organization", name: "Busha", url: "https://busha.co" },
  sameAs: ["https://x.com/michael_adeyeri"],
};

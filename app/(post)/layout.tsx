import { Header } from "./header";
import { getPosts } from "../get-posts";
import { BackLink } from "../back-link";
import { Footer } from "../footer";

export const revalidate = 300;

export default async function Layout({ children }) {
  const posts = await getPosts();

  return (
    <div className="max-w-2xl mx-auto pt-8 md:pt-14">
      <article className="mb-10 text-lg leading-relaxed">
        <BackLink />
        <Header posts={posts} />

        <div className="post-body">{children}</div>
      </article>
      <Footer />
    </div>
  );
}

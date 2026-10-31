import { getPosts } from "@/app/get-posts";
import { postCard } from "@/app/og";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPosts()).map(post => ({ id: post.id }));
}

export async function GET(_req: Request, props) {
  const { id } = await props.params;
  const post = (await getPosts()).find(p => p.id === id);
  if (!post) return new Response("Not found", { status: 404 });
  return postCard(post);
}

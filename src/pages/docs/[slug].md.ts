import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";

export async function getStaticPaths() {
  const docs = await getCollection("docs");
  return docs.map((d) => ({ params: { slug: d.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const doc = await getEntry("docs", params.slug!);
  const text = `# ${doc!.data.title}\n\n${doc!.data.description}\n\n${doc!.body ?? ""}`;
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};

import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const docs = await getCollection("docs");
  const links = docs
    .sort((a, b) => (a.data.sidebar.order ?? 99) - (b.data.sidebar.order ?? 99))
    .map((d) => `- [${d.data.title}](${new URL(`/${d.id}/`, site)})${d.data.description ? `: ${d.data.description}` : ""}`);
  const body = [
    "# Bunzzle",
    "",
    "> Self-hosted email delivery engine for apps. Open source, Bun-native.",
    "",
    "## Docs",
    "",
    ...links,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

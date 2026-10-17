import type { APIRoute } from "astro";
import { href, ordered, sections } from "@/lib/docs";
import { site } from "@/lib/site";

export const GET: APIRoute = async ({ site: origin }) => {
  const docs = await ordered();
  const body = [
    "# Bunzzle",
    "",
    `> ${site.description}`,
    "",
    "Every page is also available as Markdown at the same path with .md (for example /docs/install.md).",
    ...sections.flatMap((s) => [
      "",
      `## ${s}`,
      "",
      ...docs
        .filter((d) => d.data.section === s)
        .map((d) => `- [${d.data.title}](${new URL(href(d), origin)}): ${d.data.description}`),
    ]),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

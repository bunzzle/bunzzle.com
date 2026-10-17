import { type CollectionEntry, getCollection } from "astro:content";

export const sections = ["Getting started", "Guides", "Reference"];

export type Doc = CollectionEntry<"docs">;

export const href = (d: Doc) => (d.id === "index" ? "/docs/" : `/docs/${d.id}/`);

export async function ordered() {
  const docs = await getCollection("docs");
  return docs.sort(
    (a, b) => sections.indexOf(a.data.section) - sections.indexOf(b.data.section) || a.data.order - b.data.order,
  );
}

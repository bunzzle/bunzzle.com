import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://bunzzle.com",
  integrations: [
    starlight({
      title: "Bunzzle",
      logo: { src: "./src/assets/bunzzle.svg" },
      favicon: "/favicon.svg",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/bunzzle/bunzzle" }],
      customCss: [
        "@fontsource-variable/bricolage-grotesque",
        "@fontsource-variable/geist",
        "@fontsource-variable/geist-mono",
        "./src/styles/tokens.css",
        "./src/styles/docs.css",
      ],
      sidebar: [{ label: "Docs", items: [{ autogenerate: { directory: "docs" } }] }],
    }),
  ],
});

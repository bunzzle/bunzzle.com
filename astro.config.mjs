import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders, passthroughImageService } from "astro/config";

export default defineConfig({
  site: "https://bunzzle.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  image: {
    service: passthroughImageService(),
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      weights: ["700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
});

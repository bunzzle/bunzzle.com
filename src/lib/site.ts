export const site = {
  name: "Bunzzle",
  url: "https://bunzzle.com",
  description: "Self-hosted email delivery engine for apps. Sends straight to every inbox. Open source, Bun-native, one binary.",
  repo: "https://github.com/bunzzle/bunzzle",
  siteRepo: "https://github.com/bunzzle/bunzzle.com",
  email: "hello@bunzzle.com",
  author: { name: "Hamza Kargin", url: "https://hamzakargin.com" },
  release: "v0.1.0",
};

export const links = {
  releases: `${site.repo}/releases`,
  latest: `${site.repo}/releases/latest`,
  issues: `${site.repo}/issues`,
  security: `${site.repo}/security`,
  license: `${site.repo}/blob/main/LICENSE`,
  bench: `${site.repo}/blob/main/bench/README.md`,
  installScript: `${site.repo}/releases/latest/download/install.sh`,
};

export const navLinks: [label: string, href: string][] = [
  ["Docs", "/docs/"],
  ["API", "/docs/api/"],
  ["Changelog", links.releases],
];

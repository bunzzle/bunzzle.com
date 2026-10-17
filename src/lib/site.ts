export const site = {
  name: "Bunzzle",
  url: "https://bunzzle.com",
  description: "Email infrastructure you run yourself. A complete delivery engine with reputation built in. One binary, no external database, open source.",
  org: "https://github.com/bunzzle",
  repo: "https://github.com/bunzzle/bunzzle",
  siteRepo: "https://github.com/bunzzle/bunzzle.com",
  email: "hello@bunzzle.com",
  author: { name: "Hamza Kargin", url: "https://hamzakargin.com" },
  logo: "/logo.png",
  x: { handle: "@bunzzledev", url: "https://x.com/bunzzledev" },
  bluesky: { handle: "@bunzzle.com", url: "https://bsky.app/profile/bunzzle.com" },
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

# bunzzle.com

The website for [Bunzzle](https://github.com/bunzzle/bunzzle), a self-hosted email delivery engine for apps.

## Development

```sh
bun install
bun run dev
```

`bun run check` type-checks the site and `bun run build` writes the static site to `dist/` and builds the search index.

```
src/
  assets/            logo and icons (SVGs used as components)
  components/
    brand/           logo and the animated mark
    layout/          header, footer, search
    landing/         sections of the home page
    docs/            sidebar, table of contents, page actions, pager
  content/docs/      documentation pages (Markdown)
  layouts/           BaseLayout, DocsLayout
  lib/               site constants and docs helpers
  pages/             routes, llms.txt, robots.txt, Markdown copies of each docs page
  styles/            tokens, global styles, docs prose
```

## License

The code in this repository is released under the [MIT License](LICENSE).

The Bunzzle name and logo are not covered by this license. Please do not use them in a way that suggests your project is Bunzzle or is endorsed by it.

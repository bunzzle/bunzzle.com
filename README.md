<p align="center"><img src="src/assets/bunzzle.svg" width="96" alt="Bunzzle"></p>

# bunzzle.com

The website and documentation for [Bunzzle](https://github.com/bunzzle/bunzzle), a self-hosted email delivery engine for apps.

- **Landing page:** what Bunzzle is, how to install it, benchmarks.
- **Docs:** install, quickstart, API, deliverability, security, FAQ.
- **For AI tools:** every docs page is also available as Markdown, listed in [`/llms.txt`](https://bunzzle.com/llms.txt).

## Run it locally

```sh
bun install
bun run dev
```

`bun run check` checks types, `bun run build` builds the site into `dist/` with its search index.

## Edit the docs

Docs pages are Markdown files in [`src/content/docs`](src/content/docs). Each page has a `title`, `description`, `section` and `order` at the top. Open a pull request with your change; every page has an "Edit on GitHub" link.

## Security

Found a security issue in Bunzzle? Please report it privately, see [SECURITY.md](https://github.com/bunzzle/bunzzle/blob/main/SECURITY.md).

## License

The code in this repository is released under the [MIT License](LICENSE).

The Bunzzle name and logo are not covered by this license. Please do not use them in a way that suggests your project is Bunzzle or is endorsed by it.

# Repository Guidelines

This site is a [Quartz 5](https://quartz.jzhao.xyz/) digital garden, authored as Markdown in [Obsidian](https://obsidian.md/) and deployed to GitHub Pages.

## Project Structure & Module Organization
- All published content lives in `content/`, which is also an Obsidian vault (`content/.obsidian/`). The home page is `content/index.md`.
- Posts live in `content/posts/`; top-level pages like `content/about.md` and `content/projects.md` sit at the vault root.
- Images and other attachments live in `content/attachments/` and are embedded with Obsidian wikilinks, e.g. `![[figure.png]]`.
- Internal links use wikilinks (`[[posts/representation-engineering|label]]`); link resolution is `shortest`, matching the Obsidian vault config.
- The Quartz engine is vendored in `quartz/`. Site configuration is `quartz.config.yaml`; the plugin lockfile is `quartz.lock.json`.
- Build output goes to `public/` and is gitignored. Plugins install to `.quartz/` (gitignored) via `npx quartz plugin install`.

## Build, Test, and Development Commands
- `npm ci` — install dependencies (Node >= 22, npm >= 10.9.2).
- `npx quartz plugin install` — install Quartz plugins listed in `quartz.lock.json` (required after a fresh clone).
- `npx quartz build --serve` — build and serve locally at `http://localhost:8080` with hot reload.
- `npx quartz build` — produce a production bundle in `public/`.

## Authoring Content
- Open `content/` as a vault in Obsidian to edit, preview, and link notes.
- Frontmatter fields Quartz understands: `title`, `description`, `tags`, `date`, `draft`, `aliases`, `permalink`. Pages with `draft: true` are excluded from the build.
- Prefer wikilinks for both notes and image embeds so links survive file moves.
- Callouts use Obsidian syntax (`> [!info] Title`); LaTeX (`$...$`, `$$...$$`), tables, footnotes, and syntax highlighting work out of the box.
- Do not introduce emojis anywhere in site content, commit messages, or tooling output.

## Testing Guidelines
- There is no automated test suite. Before opening a PR, run `npx quartz build` and confirm it completes without warnings about missing files or broken links, then spot-check with `npx quartz build --serve`.
- For visual changes, capture a screenshot from the local preview.

## Deployment
- Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds Quartz and deploys `public/` to GitHub Pages.
- `baseUrl` in `quartz.config.yaml` is `cluttered-cabinet.github.io`; keep it in sync if the domain changes.

## Commit & Pull Request Guidelines
- Prefer concise, imperative subjects (`Add new post`, `Fix broken image link`).
- Do not commit generated `public/` assets or the `.quartz/` plugin cache.
- PRs should summarize intent, note the testing performed (`build`, local `preview`), and include media for visual changes.

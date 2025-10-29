# Repository Guidelines

## Project Structure & Module Organization
- Astro entrypoints sit in `src/pages/`, with shared wrappers in `src/layouts/` and UI elements in `src/components/`.
- Markdown content lives in `src/content/` (notably the `posts` collection); keep media under `public/` so Astro can serve it statically.
- Tailwind and site-wide styles live in `src/styles/`, while reusable conversion helpers are in `scripts/` (see `convert-notebook.py` for notebook imports).
- Build artifacts land in `dist/`; delete before committing if you run a local build.

## Build, Test, and Development Commands
- `npm run dev` — start the Astro dev server with hot reload for pages and components.
- `npm run build` — run `astro check` for type/content safety, then produce a production bundle in `dist/`.
- `npm run preview` — serve the latest build to verify routing and styling before publishing.
- `npx astro check` — quick type and content collection validation without generating output.

## Coding Style & Naming Conventions
- Use two-space indentation across `.astro`, `.ts(x)`, and configuration files; keep imports sorted by path depth as in existing modules.
- Name React components and Astro files in PascalCase (`Hero.tsx`, `PostCard.astro`); content collections use kebab-case slugs that match file names.
- Favor Tailwind utility classes already in use; avoid introducing global CSS unless the pattern repeats across pages.
- Keep scripts and config files in modern ESM (`import`/`export`) to align with `astro.config.mjs` and `tailwind.config.mjs`.

## Testing Guidelines
- There is no automated test suite yet; rely on `npx astro check` and `npm run build` before opening a PR.
- For visual or interactive updates, capture screenshots or short screen recordings from `npm run preview` to document UX changes.
- When adding content, verify frontmatter fields and collection schema definitions compile without warnings.

## Commit & Pull Request Guidelines
- Prefer concise, imperative subjects (`Add new post template`, `Fix build warning`). Conventional prefixes such as `feat:` are welcome but not required.
- Group related changes into a single commit to keep history reviewable; avoid committing generated `dist/` assets.
- PRs should include: a summary of intent, testing performed (`build`, `preview`, etc.), linked issues when applicable, and media for UI changes.

## Content & Asset Management
- Posts generated from notebooks should pass through `scripts/convert-notebook.py` to normalize frontmatter and asset references.
- Store large assets outside the repo and reference them via URLs when feasible; keep inline images optimized (≤1200px wide, compressed).

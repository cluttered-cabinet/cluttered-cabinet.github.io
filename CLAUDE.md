# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cluttered Cabinet** is a personal research notebook / digital garden built with **Quartz 5** (https://quartz.jzhao.xyz/). Content is authored as Markdown in an Obsidian vault and deployed to GitHub Pages at `https://cluttered-cabinet.github.io`.

See `AGENTS.md` for the full repository guidelines; the essentials are summarized here.

## Common Development Commands

```bash
npm ci                      # install dependencies (Node >= 22, npm >= 10.9.2)
npx quartz plugin install   # install Quartz plugins from quartz.lock.json (required after fresh clone)
npx quartz build --serve    # build and serve locally at http://localhost:8080 with hot reload
npx quartz build            # production build into public/
npm run check               # typecheck (tsc --noEmit) and prettier --check
npm run format              # prettier --write
```

There is no automated test suite. Before opening a PR, run `npx quartz build` and confirm it completes without warnings about missing files or broken links.

## Project Structure

```
/
├── content/                # All published content; also an Obsidian vault
│   ├── index.md            # Home page
│   ├── about.md            # About page
│   ├── projects.md         # Projects page
│   ├── posts/              # Blog posts (Markdown)
│   ├── attachments/        # Images, embedded via wikilinks: ![[figure.png]]
│   └── .obsidian/          # Obsidian vault config (ignored by Quartz)
├── quartz/                 # Vendored Quartz engine — avoid editing
├── quartz.config.yaml      # Site configuration (theme, plugins, layout)
├── quartz.lock.json        # Plugin lockfile
└── .github/workflows/deploy.yml  # Builds and deploys public/ to GitHub Pages on push to main
```

Build output goes to `public/` (gitignored). Plugins install to `.quartz/` (gitignored).

## Writing Posts

Posts are Markdown files in `content/posts/` with YAML frontmatter:

```yaml
---
title: Post Title
date: 2026-01-15
summary: Short description shown in listings
description: SEO / meta description
tags:
  - tag1
  - tag2
draft: true
---
```

- Pages with `draft: true` are excluded from the build (the `remove-draft` plugin is enabled).
- Use Obsidian wikilinks for internal links (`[[posts/some-post|label]]`) and image embeds (`![[figure.png]]`) so links survive file moves. Link resolution is `shortest`.
- Obsidian callouts (`> [!info] Title`), LaTeX (`$...$`, `$$...$$` via KaTeX), tables, footnotes, and syntax highlighting all work.
- Do not use emojis anywhere in site content, commit messages, or tooling output.

## Configuration

- Site config lives in `quartz.config.yaml`: page title, `baseUrl` (`cluttered-cabinet.github.io`), theme colors/fonts, and the plugin list with layout positions.
- Fonts: Schibsted Grotesk (headers), Source Sans Pro (body), IBM Plex Mono (code).
- Notable enabled plugins: explorer and search (left sidebar), table of contents and backlinks (right), dark mode, reader mode, breadcrumbs, RSS/sitemap (`content-index`), OG images, encrypted pages, alias redirects.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies and plugins, runs `npx quartz build`, and publishes `public/` to GitHub Pages.

## Commit & PR Guidelines

- Concise, imperative commit subjects (`Add new post`, `Fix broken image link`).
- Never commit `public/` or `.quartz/`.
- PRs should summarize intent and note the testing performed.

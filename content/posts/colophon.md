---
title: Colophon
date: "2026-06-29"
description: How this site is built — Quartz, Obsidian, and Markdown.
tags: ["meta"]
---

This site is a [Quartz](https://quartz.jzhao.xyz/) digital garden, authored as plain Markdown in [Obsidian](https://obsidian.md/) and deployed to GitHub Pages.

## How it works

- Every note lives in the `content/` folder as a Markdown file.
- Images are stored in `content/attachments/` and embedded with Obsidian-style wikilinks like `![[figure.png]]`.
- Internal links use wikilinks too: `[[representation-engineering]]` resolves to the right page no matter where it moves.
- Callouts, LaTeX, and syntax highlighting all work out of the box.

## Editing

Open the `content/` folder as a vault in Obsidian, write Markdown, and preview locally with:

```bash
npx quartz build --serve
```

Then publish by pushing to GitHub — a GitHub Actions workflow rebuilds and deploys the site.

## Start here

- [[index|Home]]
- [[about|About]]
- [[projects|Projects]]
- [[posts/reading-list|Reading list]]

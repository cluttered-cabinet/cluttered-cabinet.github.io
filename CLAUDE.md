# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cluttered Cabinet 2.0** is a personal blog/portfolio site built with **Astro**, a modern static site generator. The site features a dark sci-lab aesthetic inspired by Prime Intellect and Kyutai.org, with a focus on minimalism, subtle animations, and scientific elegance.

**Tech Stack:**
- **Astro** - Static site generator with content collections
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for React components
- **TypeScript** - Type-safe development

## Common Development Commands

### Local development server
```bash
npm run dev
```
Starts the Astro dev server at `http://localhost:4321` with hot module replacement. Changes to content, components, or styles will automatically refresh the browser.

### Build the site
```bash
npm run build
```
Generates the static site and outputs to `dist/`. This runs type checking and builds the production-ready site.

### Preview production build
```bash
npm run preview
```
Serves the built site locally to preview the production build before deployment.

### Type checking
```bash
npx astro check
```
Runs TypeScript type checking on the entire project, including Astro files.

## Project Structure

```
/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.astro    # Site header with navigation
│   │   ├── Footer.astro    # Site footer
│   │   ├── Hero.tsx        # Animated hero section (React)
│   │   └── PostCard.astro  # Blog post preview card
│   ├── content/            # Content collections
│   │   ├── config.ts       # Content collection schemas
│   │   └── posts/          # Blog posts (Markdown)
│   ├── layouts/
│   │   └── Layout.astro    # Base layout wrapper
│   ├── pages/              # File-based routing
│   │   ├── index.astro     # Homepage with hero + featured posts
│   │   ├── about.astro     # About page
│   │   ├── posts.astro     # Posts list
│   │   ├── projects.astro  # Projects showcase
│   │   └── posts/
│   │       └── [...slug].astro  # Dynamic post routes
│   └── styles/
│       └── global.css      # Global styles and Tailwind imports
├── public/                 # Static assets (copied as-is)
│   ├── noise.png          # Background noise texture
│   └── favicon.svg        # Site favicon
├── astro.config.mjs       # Astro configuration
├── tailwind.config.mjs    # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Design System

### Colors
- **Background**: `#0A0A0C` (matte black)
- **Surface**: `#141418` (secondary background)
- **Accent**: `#3DF5E0` (cyan glow)
- **Violet Ambient**: `rgba(120, 70, 255, 0.1)` (radial gradient)
- **Text Primary**: `#E5E7EB`
- **Text Secondary**: `#9CA3AF`
- **Border**: `#1F1F23`

### Typography
- **Display Font**: Space Grotesk (headings)
- **Body Font**: Inter (body text)
- **Scale**: h1 (3.5rem), h2 (2rem), body (1rem)

### Key Features
- Noise texture overlay on background
- Radial violet gradient behind hero section
- Cyan glow effects on hover states
- Framer Motion animations (fade-in, slide-up)
- Responsive design (mobile-first)

## Writing Blog Posts

Posts are Markdown files in `src/content/posts/` with YAML frontmatter:

```yaml
---
title: "Post Title"
date: "2024-06-26"
summary: "Brief description shown in listings"
description: "SEO description"
tags: ["tag1", "tag2"]
toc: true
draft: false
---

# Your content here
```

### Frontmatter Fields
- `title` (required) - Post title
- `date` (required) - Publication date (YYYY-MM-DD format)
- `summary` (optional) - Short description for post cards
- `description` (optional) - SEO meta description
- `tags` (optional) - Array of tags
- `toc` (optional) - Enable table of contents
- `draft` (optional) - Hide from production builds

## Deployment

The site is configured for **GitHub Pages** deployment:
- **Site URL**: `https://cluttered-cabinet.github.io`
- **Build output**: `dist/` directory
- Build process: `npm run build` generates static HTML/CSS/JS

GitHub Actions can automatically build and deploy on push to main. The `astro.config.mjs` file is already configured with the correct site URL.

## Content Collections

Astro content collections provide type-safe content management. The schema is defined in `src/content/config.ts`:

```typescript
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string().optional(),
    // ... more fields
  }),
});
```

This ensures all posts have valid frontmatter and provides TypeScript autocomplete.

## Customization

### Adding New Pages
Create `.astro` files in `src/pages/`. The file path determines the URL:
- `src/pages/contact.astro` → `/contact`
- `src/pages/blog/archive.astro` → `/blog/archive`

### Modifying Styles
- **Global styles**: Edit `src/styles/global.css`
- **Tailwind config**: Edit `tailwind.config.mjs` to add custom colors, fonts, etc.
- **Component styles**: Use scoped `<style>` tags in `.astro` components or Tailwind classes

### Animation Variants
Framer Motion variants are defined in React components (e.g., `Hero.tsx`):
```typescript
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};
```

## Tips

1. **Draft posts**: Set `draft: true` in frontmatter to hide posts from production
2. **Hot reload**: Astro dev server automatically refreshes on file changes
3. **Type safety**: Use `npx astro check` to catch type errors before building
4. **Image optimization**: Place images in `public/` or use Astro's `<Image />` component for optimization
5. **Component islands**: Use `client:load` directive to hydrate React components (like Hero)

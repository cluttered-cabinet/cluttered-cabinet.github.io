import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './scripts/remark-callouts.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://cluttered-cabinet.github.io',
  integrations: [
    mdx(),
    tailwind(),
    react()
  ],
  output: 'static',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: false,
      wrap: false
    },
    remarkPlugins: [remarkCallouts, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Tufte paper-and-ink palette.
        // Names are kept from the previous design so existing utility
        // classes (text-slate-dark, bg-ivory-medium, ...) keep working;
        // only the values changed.
        'slate-dark': '#111111', // ink
        'slate-medium': '#333333',
        'slate-light': '#555555',
        'ivory-light': '#fffff8', // cream paper
        'ivory-medium': '#f7f6ee',
        'ivory-dark': '#efeee2',
        oat: '#efe9da',
        'cloud-dark': '#6b6b6b', // secondary text
        'cloud-medium': '#8a8a8a',
        'cloud-light': '#cfcdbf', // hairline rule
        clay: '#a8541f',
        olive: '#5f7048',
        sky: '#5b7a99',
        fig: '#9c3b56',
        cactus: '#7f9b8f',

        // Token aliases
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        accent: 'var(--accent-color)',
        'accent-bright': 'var(--accent-color)',
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
      },
      fontFamily: {
        // et-book everywhere; monospace reserved for code.
        sans: ['et-book', 'Palatino', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
        serif: ['et-book', 'Palatino', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tight2: '0',
        wide2: '0.04em',
        wide3: '0.08em',
      },
      borderRadius: {
        none: '0px',
        feature: '0px',
      },
    },
  },
  plugins: [],
}

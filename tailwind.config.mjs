/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Anthropic palette
        'slate-dark': '#141413',
        'slate-medium': '#3d3d3a',
        'slate-light': '#5e5d59',
        'ivory-light': '#faf9f5',
        'ivory-medium': '#f0eee6',
        'ivory-dark': '#e8e6dc',
        oat: '#e3dacc',
        'cloud-dark': '#87867f',
        'cloud-medium': '#b0aea5',
        'cloud-light': '#d1cfc5',
        clay: '#d97757',
        olive: '#788c5d',
        sky: '#6a9bcc',
        fig: '#c46686',
        cactus: '#bcd1ca',

        // Aliases — kept so existing `bg-bg`, `text-text-primary`, etc still work
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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'ui-serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tight2: '-0.02em',
        wide2: '0.12em',
        wide3: '0.2em',
      },
      borderRadius: {
        none: '0px',
        feature: '24px',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        accent: 'var(--accent-color)',
        'accent-bright': 'var(--accent-color)',
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
        sans: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url('/noise.png')",
        'radial-glow': "radial-gradient(circle at 50% 20%, var(--radial-glow), transparent 70%)"
      }
    }
  },
  plugins: [],
}

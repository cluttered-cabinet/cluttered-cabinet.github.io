/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0C',
        surface: '#141418',
        accent: '#3DF5E0',
        'accent-bright': '#00FFF0',
        violet: 'rgba(120, 70, 255, 0.1)',
        border: '#1F1F23',
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
        sans: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'noise': "url('/noise.png')",
        'radial-glow': "radial-gradient(circle at 50% 20%, rgba(120, 70, 255, 0.1), transparent 70%)"
      }
    }
  },
  plugins: [],
}

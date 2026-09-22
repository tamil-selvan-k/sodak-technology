import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0f1e',
          900: '#0f1729',
          800: '#1a2342',
          700: '#253054',
          600: '#354470',
        },
        gold: {
          600: '#a88520',
          500: '#c8a035',
          400: '#d4b04a',
          300: '#e0c470',
        },
        dm: {
          accent:   '#075892',
          'accent-lt': '#29b6f6',
          surface:  '#f3f4f6',
          text:     '#0d1726',
          muted:    '#9ca3af',
          border:   '#e5e7eb',
          foreground: '#1d3658',
        },
      },
      fontFamily: {
        sans:     ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        heading:  ['var(--font-instrument-sans)', 'var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        dark: '0 4px 20px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        glass: '20px',
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}

export default config

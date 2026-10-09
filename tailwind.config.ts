import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          main:    '#1E40AF',
          primary: '#2563EB',
          light:   '#3B82F6',
          bg:      '#EFF6FF',
          dark:    '#172554',
        },
        navy: {
          950: '#172554',
          900: '#1e3a8a',
          800: '#1e40af',
          700: '#2563eb',
          600: '#3b82f6',
        },
        gold: {
          600: '#1d4ed8',
          500: '#2563eb',
          400: '#3b82f6',
          300: '#60a5fa',
        },
        dm: {
          accent:      '#2563EB',
          'accent-lt': '#3B82F6',
          surface:     '#EFF6FF',
          text:        '#172554',
          muted:       '#64748B',
          border:      '#DBEAFE',
          foreground:  '#1E40AF',
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
        dark: '0 4px 20px rgba(30,64,175,0.25)',
        card: '0 2px 12px rgba(37,99,235,0.06)',
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

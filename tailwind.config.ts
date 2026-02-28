import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-page':        'var(--bg-page)',
        'bg-card':        'var(--bg-card)',
        'bg-card-hover':  'var(--bg-card-hover)',
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary':  'var(--text-tertiary)',
        'accent-amber':   'var(--accent-amber)',
        'accent-amber-dark': 'var(--accent-amber-hover)',
        'accent-blue':    'var(--accent-blue)',
        'accent-green':   'var(--accent-green)',
        'accent-red':     'var(--accent-red)',
        'border-subtle':  'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong':  'var(--border-strong)',
      },
      fontFamily: {
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
        'roboto-mono':   ['var(--font-roboto-mono)', 'monospace'],
        'inter':         ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

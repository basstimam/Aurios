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
        'bg-page': '#07080B',
        'bg-card': '#0D0E15',
        'bg-card-hover': '#141519',
        'bg-card-alt': '#0A0B0D',
        'text-primary': '#F4EFE8',
        'text-secondary': '#9B9081',
        'text-tertiary': '#6B625A',
        'text-muted': '#6B7280',
        'accent-amber': '#F59E0B',
        'accent-amber-dark': '#D97706',
        'accent-blue': '#3B82F6',
        'accent-green': '#22C55E',
        'accent-red': '#EF4444',
        'border-subtle': '#1C1D27',
        'border-default': '#252838',
        'border-strong': '#374151',
      },
      fontFamily: {
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
        'roboto-mono': ['var(--font-roboto-mono)', 'monospace'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

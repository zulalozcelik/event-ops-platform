import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        card: 'var(--card)',
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        destructive: 'var(--destructive)',
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

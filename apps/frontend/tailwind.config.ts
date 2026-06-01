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
        'accent-foreground': 'var(--accent-foreground)',
        'secondary-accent': 'var(--secondary-accent)',
        'secondary-accent-soft': 'var(--secondary-accent-soft)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        card: 'var(--card)',
        foreground: 'var(--foreground)',
        'muted-foreground': 'var(--muted-foreground)',
        destructive: 'var(--destructive)',
        'destructive-muted': 'var(--destructive-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        'focus-ring': 'var(--focus-ring)',
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Atkinson Hyperlegible', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

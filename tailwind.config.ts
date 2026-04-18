import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'content-bg': 'var(--content-bg)',
        panel: 'var(--panel)',
        'panel-2': 'var(--panel-2)',
        'card-bg': 'var(--card-bg)',

        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',

        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-active': 'var(--primary-active)',
        'primary-fg': 'var(--primary-foreground)',
        'primary-subtle': 'var(--primary-subtle-bg)',

        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        'secondary-subtle': 'var(--secondary-subtle-bg)',

        hover: 'var(--hover)',
        'hover-fg': 'var(--hover-foreground)',

        'input-bg': 'var(--input-bg)',
        'input-text': 'var(--input-text)',
        'input-border': 'var(--input-border)',
      },
    },
  },
  plugins: [],
};

export default config;

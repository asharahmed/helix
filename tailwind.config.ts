import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#0f0f1a',
        border: '#1a1a2e',
        'border-bright': '#2a2a4e',
        cyan: {
          DEFAULT: '#00d4ff',
          dim: '#00a0cc',
          glow: 'rgba(0, 212, 255, 0.15)',
        },
        amber: {
          DEFAULT: '#ffb800',
          dim: '#cc9300',
          glow: 'rgba(255, 184, 0, 0.15)',
        },
        red: {
          DEFAULT: '#ff3b4f',
          dim: '#cc2f3f',
          glow: 'rgba(255, 59, 79, 0.15)',
        },
        green: {
          DEFAULT: '#00e676',
          dim: '#00b85e',
          glow: 'rgba(0, 230, 118, 0.15)',
        },
        muted: '#6b7280',
        'text-primary': '#e0e0e0',
        'text-secondary': '#9ca3af',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'data-flow': 'data-flow 1.5s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'page-enter': 'page-enter 0.25s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'data-flow': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A0E27',
          dark: '#060914',
        },
        secondary: {
          DEFAULT: '#1A1F3A',
          light: '#252B4A',
        },
        accent: {
          cyan: '#00FFD1',
          purple: '#B14AED',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B3C1',
        },
        status: {
          error: '#FF4757',
          success: '#2ED573',
          warning: '#FFA502',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 209, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 209, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

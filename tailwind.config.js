/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Optimize CSS purging - remove unused styles
  // Tailwind v3+ automatically purges unused CSS based on content paths
  darkMode: 'class',
  // Safelist: classes that should never be purged (if needed)
  // Currently empty - let Tailwind purge everything unused
  safelist: [],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5ca',
          300: '#8ed0a7',
          400: '#5ab37e',
          500: '#359561',
          600: '#27784f',
          700: '#216042',
          800: '#1d4e36',
          900: '#18412d',
          950: '#0c2419',
        },
        secondary: {
          50: '#faf8f4',
          100: '#f4f0e7',
          200: '#e8dfcd',
          300: '#d9c9ab',
          400: '#c7ad83',
          500: '#b8945e',
          600: '#a88051',
          700: '#8c6844',
          800: '#72563c',
          900: '#5e4834',
          950: '#32251a',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


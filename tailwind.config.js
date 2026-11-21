/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        caos: {
          dark: '#0f0e13',
          card: '#16151d',
          cardBorder: '#292639',
          accent: '#8b5cf6',
          crimson: '#ef4444',
          gold: '#eab308',
          cyan: '#06b6d4',
          terminus: '#050505',
          genesis: '#f8fafc',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

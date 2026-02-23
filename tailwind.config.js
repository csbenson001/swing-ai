/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7', 400: '#66bb6a', 500: '#1B5E20', 600: '#155a1a', 700: '#0f4514', 800: '#0a300e', 900: '#061c08' },
        gold: { 400: '#FFD700', 500: '#daa520' },
        navy: { 800: '#1A1A2E', 900: '#12121f' },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6f0',
          100: '#fae8d8',
          200: '#f4ccaa',
          300: '#ecaa74',
          400: '#e28240',
          500: '#d9652a',
          600: '#c4501f',
          700: '#a33d1a',
          800: '#83321b',
          900: '#6b2b18',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
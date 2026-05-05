/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#ebebee',
          200: '#d3d3d9',
          300: '#a8a9b3',
          400: '#7a7c89',
          500: '#555766',
          600: '#3c3e4b',
          700: '#2a2c37',
          800: '#1a1c25',
          900: '#0d0e14',
        },
        court: {
          DEFAULT: '#c4ff3e',
          dark: '#9fd61d',
        },
        clay: '#d97742',
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf8f4',
          100: '#f5f1e8',
          200: '#e9dfc8',
          300: '#dbc7a4',
          400: '#caa876',
          500: '#be9456',
          600: '#b0824b',
          700: '#926640',
          800: '#785439',
          900: '#614530',
        },
        rosegold: {
          50: '#fdf6f3',
          100: '#fbeae6',
          200: '#f7d5ce',
          300: '#f0b8ab',
          400: '#e6957f',
          500: '#d97655',
          600: '#c45f40',
          700: '#a34e34',
          800: '#86432f',
          900: '#6f3c2d',
        },
        cream: {
          50: '#fefdfb',
          100: '#fefaf5',
          200: '#fcf4e6',
          300: '#f9ebd1',
          400: '#f4d9a7',
          500: '#ecc271',
          600: '#e0a73e',
          700: '#d18f1e',
          800: '#b0741b',
          900: '#8f5e1a',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(190, 148, 86, 0.1)',
        'dreamy': '0 8px 32px rgba(217, 118, 85, 0.15)',
        'elegant': '0 12px 40px rgba(190, 148, 86, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}', './src/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Barlow Condensed', 'sans-serif'],
        body: ['Inter', 'Manrope', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace']
      },
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        }
      }
    }
  },
  plugins: []
};

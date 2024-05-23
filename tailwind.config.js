/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './src/**/*.ts', './src/**/*.tsx'],
  content: [],
  theme: {
    extend: {
      backgroundImage: {
        solidarity: "url('./solidarity.jpg')",
      },
    },
  },
  plugins: [],
}

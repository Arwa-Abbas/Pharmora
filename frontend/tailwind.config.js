/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: "#800000", // dark maroon
        offwhite: "#f9f9f9", // softer white background
      },
    },
  },
  plugins: [],
}

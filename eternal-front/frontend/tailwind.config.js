/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        body: ['"Montserrat"', "sans-serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#c9a962",
          light: "#e8d5a3",
          dark: "#8b7340",
        },
        cream: {
          DEFAULT: "#faf7f2",
          dark: "#f3ebe0",
          warm: "#f5efe6",
        },
        blush: {
          DEFAULT: "#f2d1d1",
          light: "#faf0f0",
        },
        luxury: {
          black: "#0a0a0b",
          charcoal: "#141416",
          slate: "#1c1c1f",
        },
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("light", "html.light &");
    },
  ],
};

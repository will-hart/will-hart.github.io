module.exports = {
  content: [
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
    "./pages/**/*.ts",
    "./components/**/*.ts",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        darkbg: "#191b1f",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

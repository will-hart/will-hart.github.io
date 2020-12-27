module.exports = {
  purge: ["./pages/**/*.js", "./components/**/*.js"],
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

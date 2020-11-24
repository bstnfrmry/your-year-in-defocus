// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.tsx"],
  theme: {
    extend: {},
    fontFamily: {
      raleway: ["Raleway", "sans serif"],
    },
    colors: {
      white: colors.white,
      gray: colors.warmGray,
      green: colors.emerald,
      red: colors.red,
      orange: colors.amber,
      yellow: colors.yellow,
      blue: colors.lightBlue,
      purple: colors.violet,
      pink: colors.rose,
    },
  },
  variants: {},
  plugins: [],
};

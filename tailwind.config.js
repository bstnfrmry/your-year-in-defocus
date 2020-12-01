// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.tsx"],
  theme: {
    extend: {},
    fontFamily: {
      raleway: ["Raleway", "sans serif"],
      mono: ["Roboto Mono", "mono"],
    },
    colors: {
      white: colors.white,
      gray: colors.warmGray,
      green: colors.emerald,
      red: colors.red,
      orange: colors.orange,
      yellow: colors.yellow,
      blue: colors.lightBlue,
      purple: colors.violet,
      pink: colors.rose,
    },
  },
  variants: {},
  plugins: [],
};

module.exports = {
  plugins: {
    "tailwindcss": require("./tailwind.config.js"),
    "postcss-preset-env": {
      stage: 1,
      features: {
        "focus-within-pseudo-class": false,
      },
    },
  },
};

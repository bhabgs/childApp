module.exports = {
  plugins: [
    require("postcss-preset-env"),
    require("postcss-px-to-viewport")({
      unitToConvert: "px",
      viewportWidth: 1920,
      unitPrecision: 5,
      propList: ["*"],
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      selectorBlackList: [],
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      exclude: [/inl-card-v2/],
      include: undefined,
      landscape: false,
    }),
  ],
};

const path = require("path");
module.exports = {
  mode: "production",
  watch: true,
  entry: {
    "style-css": "./custom/style-css.js",
    "style-less": "./custom/style-less.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
};
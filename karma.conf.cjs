module.exports = (config) => {
  config.set({
    frameworks: ["jasmine", "webpack"],
    plugins: ["karma-jasmine", "karma-webpack", "karma-chrome-launcher"],
    files: [{ pattern: "src/tests/**/*.spec.jsx", watched: false }],
    preprocessors: { "src/tests/**/*.spec.jsx": ["webpack"] },
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]],
              },
            },
          },
          { test: /\.css$/, use: ["style-loader", "css-loader"] },
        ],
      },
      resolve: { extensions: [".js", ".jsx"] },
    },
    browsers: ["ChromeHeadless"],
    reporters: ["progress"],
    singleRun: true,
  });
};

const { merge } = require('webpack-merge');

const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = require('./webpack.config.common.js');
module.exports = merge(baseConfig, {
  devtool: 'source-map',
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        exclude: /\.min\.js$/gi,
        terserOptions: {
          mangle: true,
        },
      }),
    ],
  },
});

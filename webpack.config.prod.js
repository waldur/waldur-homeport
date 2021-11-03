const { merge } = require('webpack-merge');

const TerserPlugin = require('terser-webpack-plugin');
// const OfflinePlugin = require('offline-plugin');

const baseConfig = require('./webpack.config.common.js');
const utils = require('./webpack.utils');
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
  plugins: [
    // it's always better if OfflinePlugin is the last plugin added
    // new OfflinePlugin({
    //   ServiceWorker: {
    //     output: './sw.js',
    //   },
    // }),
  ],
});

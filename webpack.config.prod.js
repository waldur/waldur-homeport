const baseConfig = require('./webpack.config.common.js');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const OfflinePlugin = require('offline-plugin');

module.exports = merge(baseConfig, {
  devtool: '',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      mangle: true,
      output: {
        screw_ie8: true
      },
      exclude: [/\.min\.js$/gi]
    }),
    // it's always better if OfflinePlugin is the last plugin added
    new OfflinePlugin({
      ServiceWorker: {
        output: './sw.js',
      },
    }),
  ],
});

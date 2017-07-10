var baseConfig = require('./webpack.config.common.js');
var webpack = require('webpack');
const merge = require('webpack-merge');
var path = require('path');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var OfflinePlugin = require('offline-plugin');

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, './dist/static/'),
    filename: 'js/[name]-bundle.[chunkhash].js'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      // mangle brakes angular.
      mangle: false,
      output: {
        screw_ie8: true
      },
      exclude: [/\.min\.js$/gi]
    }),
    // it's always better if OfflinePlugin is the last plugin added
    new OfflinePlugin(),
  ],
});

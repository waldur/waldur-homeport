var baseConfig = require('./webpack.config.common.js');
var webpack = require('webpack');
const merge = require('webpack-merge');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var OfflinePlugin = require('offline-plugin');

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, './dist/static/'),
    publicPath: 'static/',
    filename: 'js/[name]-bundle.[chunkhash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index-template.html',
      filename: path.resolve(__dirname, './dist/index.html'),
      inject: 'body',
      chunks: ['vendor', 'index'],
      alwaysWriteToDisk: true,
      chunksSortMode: function(a, b) {
        return (a.names[0] < b.names[0]) ? 1 : -1;
      }
    }),
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
    new CopyWebpackPlugin([
      {from: './app/static/js/i18n/', to: './js/i18n/'}
    ]),
    // it's always better if OfflinePlugin is the last plugin added
    new OfflinePlugin({
      ServiceWorker: {
        output: '../sw.js',
      },
    }),
  ],
});

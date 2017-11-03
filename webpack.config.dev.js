var baseConfig = require('./webpack.config.common.js');
var webpack = require('webpack');
const merge = require('webpack-merge');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CleanUpStatsPlugin = require('./webpack-cleanup-stats');
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, './app/'),
    filename: 'static/js/[name]-bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index-template.html',
      filename: path.resolve(__dirname, './app/index.html'),
      inject: 'body',
      chunks: ['vendor', 'index'],
      alwaysWriteToDisk: true,
      chunksSortMode: function(a, b) {
        return (a.names[0] < b.names[0]) ? 1 : -1;
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {from: './app/scripts/configs/config.json', to: './scripts/configs/config.json', toType: 'file'},
    ]),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      failOnError: false,
    }),
    new CleanUpStatsPlugin(),
    new HtmlWebpackHarddiskPlugin({
      outputPath: path.resolve(__dirname, './app'),
    }),
  ],
  watch: true,
  devServer: {
    // look for missing files in app folder (app has to be built one more time for this)
    contentBase: path.resolve(__dirname, './app/'),
    hot: true,
    inline: true,
    port: 8001,
  }
});

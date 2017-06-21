var baseConfig = require('./webpack.config.common.js');
var webpack = require('webpack');
const merge = require('webpack-merge');
var path = require('path');

var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, './app/'),
    filename: 'js/[name]-bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {from: './app/scripts/configs/config.json', to: './scripts/configs/config.json', toType: 'file'},
    ]),
  ],
  watch: true,
  failOnError: false,
  debug: true,
  devServer: {
    // look for missing files in app folder (app has to be built one more time for this)
    contentBase: path.resolve(__dirname, './app/'),
    hot: true,
    inline: true,
    port: 8001,
  }
});

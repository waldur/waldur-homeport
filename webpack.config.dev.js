const baseConfig = require('./webpack.config.common.js');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanUpStatsPlugin = require('./webpack-cleanup-stats');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const utils = require('./webpack.utils');

module.exports = merge(baseConfig, {
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: './app/scripts/configs/config.json',
        to: utils.formatPath('scripts/configs/config.json'),
        toType: 'file',
      },
    ]),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      failOnError: false,
    }),
    new CleanUpStatsPlugin(),
    new HtmlWebpackHarddiskPlugin({
      outputPath: utils.formatPath('.'),
    }),
  ],
  devServer: {
    // look for missing files in app folder (app has to be built one more time for this)
    contentBase: utils.formatPath('.'),
    hot: true,
    inline: true,
    port: 8001,
    publicPath: '/',
  }
});

const baseConfig = require('./webpack.config.common.js');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

const utils = require('./webpack.utils');

const PORT = 8001;

module.exports = merge(baseConfig, {
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/configs/config.json',
          to: utils.formatPath('scripts/configs/config.json'),
          toType: 'file',
        },
      ],
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      failOnError: false,
    }),
    new HtmlWebpackHarddiskPlugin({
      outputPath: utils.formatPath('.'),
    }),
  ],
  devServer: {
    // look for missing files in app folder (app has to be built one more time for this)
    static: {
      directory: utils.formatPath('.'),
    },
    port: PORT,
    devMiddleware: {
      publicPath: '/',
    },
    historyApiFallback: {
      index: 'index.html',
    },
  },
});

const baseConfig = require('./webpack.config.common.js');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

const utils = require('./webpack.utils');

module.exports = merge(baseConfig, {
  mode: 'development',
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve('.'),
      manifest: require(utils.vendorManifest),
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(utils.vendorBundle),
      includeSourcemap: !utils.isProd,
      outputPath: 'scripts/',
      publicPath: 'scripts/',
      hash: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: './src/configs/config.json',
        to: utils.formatPath('scripts/configs/config.json'),
        toType: 'file',
      },
    ]),
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
    contentBase: utils.formatPath('.'),
    hot: true,
    inline: true,
    port: 8001,
    publicPath: '/',
    stats: 'errors-only'
  },
});

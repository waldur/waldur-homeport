const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
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
        sourceMap: true,
        parallel: true,
        exclude: /\.min\.js$/gi,
        terserOptions: {
          mangle: true,
        },
      }),
    ],
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: path.resolve('.'),
      manifest: require(utils.vendorManifest),
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(utils.vendorBundle),
      includeSourcemap: true,
      outputPath: 'scripts/',
      publicPath: 'scripts/',
      hash: true,
    }),
    // it's always better if OfflinePlugin is the last plugin added
    // new OfflinePlugin({
    //   ServiceWorker: {
    //     output: './sw.js',
    //   },
    // }),
  ],
});

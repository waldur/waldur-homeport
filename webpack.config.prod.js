const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
// const OfflinePlugin = require('offline-plugin');

const baseConfig = require('./webpack.config.common.js');
const utils = require('./webpack.utils');

module.exports = merge(baseConfig, {
  devtool: '',
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        parallel: true,
        uglifyOptions: {
          mangle: true,
          exclude: [/\.min\.js$/gi]
        }
      })
    ]
  },
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
    // it's always better if OfflinePlugin is the last plugin added
    // new OfflinePlugin({
    //   ServiceWorker: {
    //     output: './sw.js',
    //   },
    // }),
  ],
});

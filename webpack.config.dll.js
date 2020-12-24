const path = require('path');
const webpack = require('webpack');

const target = 'build.dll';

module.exports = {
  entry: {
    vendor: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'moment-timezone',

      'redux',
      'redux-form',
      'redux-form-saga',
      'redux-saga',
      'react',
      'react-dom',
      'react-redux',
    ],
  },
  output: {
    path: path.resolve(`./${target}/`),
    filename: '[name].bundle.js',

    // This is essential to have '/' for the import path resolution to work with routing enabled.
    publicPath: './',

    // The name of the global variable which the library's
    // require() function will be assigned to
    library: '[name]_[hash]_lib',
  },

  plugins: [
    // Moment locales extraction
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/,
      /(az|en-gb|et|ru|lt|lv)/,
    ),
    new webpack.DllPlugin({
      // The path to the manifest file which maps between
      // modules included in a bundle and the internal IDs
      // within that bundle
      path: `${target}/[name]-manifest.json`,
      // The name of the global variable which the library's
      // require function has been assigned to. This must match the
      // output.library option above
      name: '[name]_[hash]_lib',
    }),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  stats: {
    colors: true,
    moduleTrace: true,
    warnings: true,
  },
};

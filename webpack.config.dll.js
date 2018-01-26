const path = require('path');
const webpack = require('webpack');

const target = 'build.dll';

module.exports = {
  entry: {
    vendor: [
      'babel-polyfill',
      'raven-js',
      'lodash',
      'jquery',
      'moment',
      'bootstrap/js/tooltip',
      'bootstrap/js/modal',
      'bootstrap/js/dropdown',
      'papaparse',

      'redux',
      'redux-form',
      'redux-form-saga',
      'redux-saga',
      'react',
      'react-dom',
      'react-overlays',
      'react-redux',
      'react-select',
      'react-bootstrap/lib/Tab',
      'react-bootstrap/lib/Tabs',
      'react-bootstrap/lib/Tooltip',
      'react-bootstrap/lib/OverlayTrigger',
      'intro.js',

      'angular',
      'angular-cron-jobs',
      'angular-animate',
      'angular-block-ui',
      'angular-cookies',
      'angular-loader',
      'angular-gravatar',
      'angular-flash-alert',
      'angulartics',
      'angulartics-google-analytics',
      'angular-moment',
      'angular-resource',
      'angular-scroll',
      'angular-ui-router',
      'ui-select',
      'satellizer',
      'angular-translate',
      'angular-translate-storage-cookie',
      'angular-translate-storage-local',
      'angular-translate-loader-static-files',
      'angular-sanitize',
      'angular-ui-bootstrap',
      'angular-bind-html-compile-ci-dev',
      'oclazyload',
      'angular-intro.js',

      'react2angular',
      './app/scripts/shims/slimscroll',
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

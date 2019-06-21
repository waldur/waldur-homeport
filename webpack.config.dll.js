const path = require('path');
const webpack = require('webpack');
const utils = require('./webpack.utils');

const target = 'build.dll';

module.exports = {
  entry: {
    vendor: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      '@sentry/core',
      '@sentry/browser',
      '@sentry/types',
      '@sentry/utils',
      'lodash',
      'jquery',
      'moment-timezone',
      'bootstrap/js/tooltip',
      'bootstrap/js/modal',
      'bootstrap/js/dropdown',
      'file-saver',
      'papaparse',

      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/interaction',
      '@fullcalendar/react',
      '@fullcalendar/timegrid',
      'redux',
      'redux-form',
      'redux-form-saga',
      'redux-saga',
      'react',
      'react-dom',
      'react-overlays',
      'react-redux',
      'react-select',
      'react-bootstrap/lib/Col',
      'react-bootstrap/lib/OverlayTrigger',
      'react-bootstrap/lib/Panel',
      'react-bootstrap/lib/Row',
      'react-bootstrap/lib/Tab',
      'react-bootstrap/lib/Tabs',
      'react-bootstrap/lib/ToggleButton',
      'react-bootstrap/lib/ToggleButtonGroup',
      'react-bootstrap/lib/Tooltip',
      'react-dropzone',
      'react-gravatar',
      'attr-accept',
      'intro.js',

      'angular',
      'angular-cron-jobs',
      'angular-animate',
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

      './src/shims/slimscroll',
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

  module: {
    rules: [
      // Temporary workaround for Angular UI router and React Bootstrap integration
      {
        test: /SafeAnchor\.js$/,
        loader: 'ts-loader'
      },
    ],
  },

  plugins: [
    // Moment locales extraction
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /(az|en-gb|et|ru|lt|lv)/),

    // Temporary workaround for Angular UI router and React Bootstrap integration
    new webpack.NormalModuleReplacementPlugin(
      /SafeAnchor\.js/,
      path.resolve('./src/shims/AngularRouterAnchor.tsx')
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
  devtool: utils.isProd ? '' : 'source-map',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  stats: {
    colors: true,
    moduleTrace: true,
    warnings: true,
  },
};

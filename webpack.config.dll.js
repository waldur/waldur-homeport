const path = require('path');
const webpack = require('webpack');

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
      'moment-timezone',
      'file-saver',
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
      'react-bootstrap/lib/Button',
      'react-bootstrap/lib/ButtonGroup',
      'react-bootstrap/lib/Checkbox',
      'react-bootstrap/lib/Col',
      'react-bootstrap/lib/ControlLabel',
      'react-bootstrap/lib/Dropdown',
      'react-bootstrap/lib/DropdownButton',
      'react-bootstrap/lib/Form',
      'react-bootstrap/lib/FormControl',
      'react-bootstrap/lib/FormGroup',
      'react-bootstrap/lib/HelpBlock',
      'react-bootstrap/lib/InputGroup',
      'react-bootstrap/lib/InputGroupAddon',
      'react-bootstrap/lib/Label',
      'react-bootstrap/lib/ListGroup',
      'react-bootstrap/lib/ListGroupItem',
      'react-bootstrap/lib/MenuItem',
      'react-bootstrap/lib/Modal',
      'react-bootstrap/lib/ModalBody',
      'react-bootstrap/lib/ModalFooter',
      'react-bootstrap/lib/ModalHeader',
      'react-bootstrap/lib/ModalTitle',
      'react-bootstrap/lib/Navbar',
      'react-bootstrap/lib/OverlayTrigger',
      'react-bootstrap/lib/Panel',
      'react-bootstrap/lib/PanelBody',
      'react-bootstrap/lib/PanelGroup',
      'react-bootstrap/lib/ProgressBar',
      'react-bootstrap/lib/Radio',
      'react-bootstrap/lib/Row',
      'react-bootstrap/lib/Tab',
      'react-bootstrap/lib/Table',
      'react-bootstrap/lib/Tabs',
      'react-bootstrap/lib/ToggleButton',
      'react-bootstrap/lib/ToggleButtonGroup',
      'react-bootstrap/lib/Tooltip',
      'react-bootstrap/lib/utils/bootstrapUtils',
      'react-dropzone',
      'react-gravatar',
      'attr-accept',

      'angular',
      'angular-animate',
      'angular-cookies',
      'angular-loader',
      'angulartics',
      'angulartics-google-analytics',
      'ui-select',
      'angular-translate',
      'angular-translate-storage-cookie',
      'angular-translate-storage-local',
      'angular-translate-loader-static-files',
      'angular-sanitize',
      'angular-ui-bootstrap',
      'angular-bind-html-compile-ci-dev',
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
        loader: 'ts-loader',
      },
    ],
  },

  plugins: [
    // Moment locales extraction
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/,
      /(az|en-gb|et|ru|lt|lv)/,
    ),

    // Temporary workaround for Angular UI router and React Bootstrap integration
    new webpack.NormalModuleReplacementPlugin(
      /SafeAnchor\.js/,
      path.resolve('./src/shims/AngularRouterAnchor.tsx'),
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

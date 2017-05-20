var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var scssPath = path.resolve(__dirname, './assets/sass');
var extractPlugin = new ExtractTextPlugin('./css/bundle.min.css');

module.exports = {
  options: {
    entry: {
      index: './app/scripts/index.js',
      vendor: './app/scripts/vendor.js',
    },
    output: {
      path: path.resolve(__dirname, './app/static'),
      filename: 'js/[name]-bundle.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'ng-annotate!babel?cacheDirectory',
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          loader: 'html?minimize=true'
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract('style', 'css!sass?includePaths[]=' + scssPath)
        },
        {
          test: /\.css$/,
          loader: 'style!css'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          // replace with prodivePlugin when slimscroll is migrated to webpack.
          test: require.resolve('jquery'),
          loader: 'expose?jQuery!expose?$'
        },
        {
          test: /\.(eot|svg|otf|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
          loader: 'url'
        },
        {
          test: /\.(jpe?g|gif|png)$/,
          loader: 'file?emitFile=false&name=[path][name].[ext]'
        },
        {
          test: /bootstrap.+\.js$/,
          // imports loader must be replaced with ProvidePlugin when slimscroll is gone.
          loader: 'imports?jQuery=jquery,$=jquery,this=>window'
        }
      ]
    },
    plugins: [
      extractPlugin,
    ],
    stats: {
      children: false,
      hash: false,
      version: false,
      warnings: false,
      errorDetails: true,
    },
  },
  dev: {
    watch: true,
    keepalive: true,
    failOnError: false,
    devtool: 'source-map',
    debug: true,
  },
  prod: {
    plugins: [
      extractPlugin,
      new webpack.optimize.DedupePlugin(),
    ]
  }
};

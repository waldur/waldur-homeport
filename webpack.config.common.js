var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var OfflinePlugin = require('offline-plugin');

var scssPath = path.resolve(__dirname, './assets/sass');
var imagesPath = path.resolve(__dirname, './assets/images');
var extractPlugin = new ExtractTextPlugin('css/[name]-bundle-[contenthash].css');
var momentLocalesPlugin = new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en-gb|et|ru|lt|lv)/);

module.exports = {
  entry: {
    index: './app/scripts/index.js',
    vendor: './app/scripts/vendor.js',
  },
  output: {
    path: path.resolve(__dirname, './app/static'),
    filename: 'js/[name]-bundle.js'
  },
  devtool: 'source-map',
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
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss?sourceMap!sass?sourceMap&includePaths[]=' + scssPath)
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
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
        test: /\.(eot|svg|otf|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'file?publicPath=../&name=fonts/[name].[ext]?[hash]'
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        loader: 'file?publicPath=../&name=images/[name].[ext]?[hash]',
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
    momentLocalesPlugin,
    // some files are not referenced explicitly, copy them.
    new CopyWebpackPlugin([
      {from: './app/views', to: '../views'},
      {from: './app/static/js/i18n/', to: './js/i18n/'},
      {from: path.resolve(imagesPath, './appstore'), to: './images/appstore'},
      {from: path.resolve(imagesPath, './help'), to: './images/help'},
      {from: path.resolve(imagesPath, './waldur'), to: './images/waldur'},
      // favicon is a part of white-labeling, store such resources separately.
      // https://opennode.atlassian.net/wiki/display/WD/HomePort+configuration#HomePortconfiguration-White-labeling
      {from: path.resolve(imagesPath, './favicon.ico'), to: './images/favicon.ico', toType: 'file'},
    ]),
    new HtmlWebpackPlugin({
      template: './app/index-template.html',
      filename: '../index.html',
      inject: 'body',
    }),
    // it's always better if OfflinePlugin is the last plugin added
    new OfflinePlugin()
  ],
  stats: {
    children: false,
    hash: false,
    version: false,
    warnings: false,
    errorDetails: true,
  }
};

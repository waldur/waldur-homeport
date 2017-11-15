const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AngularGetTextPlugin = require('./angular-gettext-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const utils = require('./webpack.utils');

const scssPath = path.resolve('./assets/sass');
const imagesPath = path.resolve('./assets/images');

module.exports = {
  entry: {
    index: './app/scripts/index.js',
  },
  output: {
    path: utils.formatPath('.'),
    publicPath: '',
    filename: 'scripts/[name].bundle.js?[hash]',
    chunkFilename: 'scripts/[name].js?[chunkhash]',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@waldur': path.resolve('./app/scripts/components/')
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            utils.isProd ? 'css-loader': 'css-loader?sourceMap',
            utils.isProd ? 'postcss-loader': 'postcss-loader?sourceMap',
            utils.isProd ? 'sass-loader?includePaths[]=' + scssPath : 'sass-loader?sourceMap&includePaths[]=' + scssPath,
          ]
        }),
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: utils.isProd ? 'css-loader' : 'css-loader?sourcemap',
        })
      },
      {
        test: /\.(eot|svg|otf|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '../',
              name: 'fonts/[name].[ext]?[hash]'
            }
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '../',
              name: 'images/[name].[ext]?[hash]'
            },
          },
        ],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index-template.html',
      filename: utils.formatPath('index.html'),
      inject: 'body',
      chunks: ['index'],
      alwaysWriteToDisk: true,
      chunksSortMode: function(a, b) {
        return (a.names[0] < b.names[0]) ? 1 : -1;
      }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name]-bundle.css?[contenthash]'
    }),
    // Moment locales extraction
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en-gb|et|ru|lt|lv)/),
    // some files are not referenced explicitly, copy them.
    new CopyWebpackPlugin([
      {from: './app/views', to: utils.formatPath('./views')},
      {from: path.resolve(imagesPath, './appstore'), to: utils.formatPath('images/appstore')},
      {from: path.resolve(imagesPath, './help'), to: utils.formatPath('images/help')},
      {from: path.resolve(imagesPath, './waldur'), to: utils.formatPath('images/waldur')},
      // favicon is a part of white-labeling, store such resources separately.
      // https://opennode.atlassian.net/wiki/display/WD/HomePort+configuration#HomePortconfiguration-White-labeling
      {from: path.resolve(imagesPath, './favicon.ico'), to: utils.formatPath('images/favicon.ico'), toType: 'file'},
      {from:  './app/manifest.json', to: utils.formatPath('manifest.json'), toType: 'file'},
    ]),
    // Internationalization plugin, extracts strings for translation, and generates JSON dictionaries based on the already translated ones.
    new AngularGetTextPlugin({
      compileTranslations: {
        input: path.resolve('./i18n/*.po'),
        outputFolder: 'scripts/i18n',
        format: 'json',
      },
      extractStrings: {
        patterns: [
          'app/views/**/*.html',
          'app/scripts/components/**/*.html',
          'app/scripts/**/*.js',
          'app/scripts/**/*.jsx',
          'app/scripts/**/*.ts',
          'app/scripts/**/*.tsx',
        ],
        destination: path.resolve('./i18n/template.pot'),
        lineNumbers: false,
        markerNames: ['gettext', 'translate']
      }
    }),
  ],
  stats: {
    children: false,
    hash: false,
    version: false,
    warnings: false,
    errorDetails: true,
  }
};

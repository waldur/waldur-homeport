const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AngularGetTextPlugin = require('./angular-gettext-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const utils = require('./webpack.utils');

const scssPath = path.resolve('./src/');
const imagesPath = path.resolve('./src/images');

module.exports = {
  entry: {
    index: './src/index.js',
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
      '@waldur': path.resolve('./src/'),
      sass: path.resolve('./src/sass/'),
    }
  },
  devtool: utils.isProd ? '' : 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'cache-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'cache-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: utils.isProd,
            },
          },
          {
            loader: path.resolve('./html-lint-loader'),
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          utils.isProd ? MiniCssExtractPlugin.loader : 'style-loader?sourceMap',
          utils.isProd ? 'css-loader': 'css-loader?sourceMap',
          utils.isProd ? 'postcss-loader': 'postcss-loader?sourceMap',
          utils.isProd ? 'sass-loader?includePaths[]=' + scssPath : 'sass-loader?sourceMap&includePaths[]=' + scssPath,
        ]
      },
      {
        test: /\.css$/,
        use: [
          utils.isProd ? MiniCssExtractPlugin.loader : 'style-loader?sourceMap',
          utils.isProd ? 'css-loader' : 'css-loader?sourcemap',
        ],
      },
      {
        test: /\.font\.js/,
        use: [
          utils.isProd ? MiniCssExtractPlugin.loader : 'style-loader?sourceMap',
          'css-loader',
          {
            loader: 'webfonts-loader',
            options: {
              embed: utils.isProd,
            },
          },
        ],
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
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'markdown-loader',
          },
        ]
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index-template.html',
      filename: utils.formatPath('index.html'),
      inject: 'body',
      chunks: ['index'],
      alwaysWriteToDisk: true,
      chunksSortMode: function(a, b) {
        return (a.names[0] < b.names[0]) ? 1 : -1;
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css?[contenthash]'
    }),
    // some files are not referenced explicitly, copy them.
    new CopyWebpackPlugin([
      {from: './src/views', to: utils.formatPath('./views')},
      {from: path.resolve(imagesPath, './appstore'), to: utils.formatPath('images/appstore')},
      {from: path.resolve(imagesPath, './help'), to: utils.formatPath('images/help')},
      {from: path.resolve(imagesPath, './waldur'), to: utils.formatPath('images/waldur')},
      {from: path.resolve(imagesPath, './service-providers'), to: utils.formatPath('images/service-providers')},
      // favicon is a part of white-labeling, store such resources separately.
      // https://opennode.atlassian.net/wiki/display/WD/HomePort+configuration#HomePortconfiguration-White-labeling
      {from: path.resolve(imagesPath, './favicon.ico'), to: utils.formatPath('images/favicon.ico'), toType: 'file'},
      // manifest.json is an experimental feature that is currently breaking caching
      // {from:  './app/manifest.json', to: utils.formatPath('manifest.json'), toType: 'file'},
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
          'src/**/*.html',
          'src/**/*.js',
          'src/**/*.jsx',
          'src/**/*.ts',
          'src/**/*.tsx',
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

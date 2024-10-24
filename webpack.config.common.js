const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const { addDisplayNameTransformer } = require('./ts-react-display-name');
const utils = require('./webpack.utils');
const scssPath = path.resolve('./src/');
const imagesPath = path.resolve('./src/images');

module.exports = {
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: utils.formatPath('.'),
    publicPath: utils.ASSET_PATH,
    filename: 'scripts/[name].bundle.js?[contenthash]',
    chunkFilename: 'scripts/[name].js?[chunkhash]',
  },
  cache: { type: 'filesystem' },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
    alias: {
      '@waldur': path.resolve('./src/'),
      sass: path.resolve('./src/sass/'),
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  addDisplayNameTransformer(),
                  tsImportPluginFactory([
                    {
                      libraryName: 'react-bootstrap',
                      camel2DashComponentName: false,
                    },
                    {
                      libraryName: 'react-use',
                      camel2DashComponentName: false,
                    },
                    {
                      style: false,
                      libraryName: 'lodash',
                      libraryDirectory: null,
                      camel2DashComponentName: false,
                    },
                  ]),
                ],
              }),
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
        ],
      },
      {
        test: /style\.(dark\.)?scss$/,
        include: [
          path.resolve(scssPath, 'metronic/sass/style.scss'),
          path.resolve(scssPath, 'metronic/sass/style.dark.scss'),
        ],
        use: [
          utils.isProd || utils.darkModeEnabledInDevEnv
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: [
          path.resolve(scssPath, 'metronic/sass/style.scss'),
          path.resolve(scssPath, 'metronic/sass/style.dark.scss'),
        ],
        use: [
          utils.isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: !utils.isProd,
              sassOptions: {
                includePaths: [scssPath],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !utils.isProd,
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: [
          utils.isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !utils.isProd,
            },
          },
        ],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.tsx?$/,
        use: {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // viewBox is required to resize SVGs with CSS.
                      // @see https://github.com/svg/svgo/issues/1128
                      removeViewBox: false,
                    },
                  },
                },
                'removeDimensions',
              ],
            },
          },
        },
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]?[hash]',
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]?[hash]',
        },
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
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json', 'yaml', 'shell', 'python'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        ASSET_PATH: JSON.stringify(utils.ASSET_PATH),
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      filename: utils.formatPath('index.html'),
      inject: 'body',
      chunks: ['index'],
      alwaysWriteToDisk: true,
      chunksSortMode: function (a, b) {
        return a.names[0] < b.names[0] ? 1 : -1;
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle.css?[contenthash]',
    }),
    // some files are not referenced explicitly, copy them.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(imagesPath, './appstore'),
          to: utils.formatPath('images/appstore'),
        },
        // favicon is a part of white-labeling, store such resources separately.
        // https://opennode.atlassian.net/wiki/display/WD/HomePort+configuration#HomePortconfiguration-White-labeling
        {
          from: path.resolve(imagesPath, './favicon.ico'),
          to: utils.formatPath('images/favicon.ico'),
          toType: 'file',
        },
        {
          from: path.resolve(imagesPath, './login_logo.png'),
          to: utils.formatPath('images/login_logo.png'),
        },
      ],
    }),
  ],
  stats: 'minimal',
};

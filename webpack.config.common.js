const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const utils = require('./webpack.utils');
const scssPath = path.resolve('./src/');
const imagesPath = path.resolve('./src/images');

module.exports = {
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: utils.formatPath('.'),
    publicPath: '/',
    filename: 'scripts/[name].bundle.js?[contenthash]',
    chunkFilename: 'scripts/[name].js?[chunkhash]',
  },
  cache: { type: 'filesystem' },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
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
        test: /\.scss$/,
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
        test: /\.(eot|svg|otf|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?/,
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

    new HtmlWebpackPlugin({
      template: './src/index-template.html',
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
        { from: './src/views', to: utils.formatPath('./views') },
        {
          from: path.resolve(imagesPath, './appstore'),
          to: utils.formatPath('images/appstore'),
        },
        {
          from: path.resolve(imagesPath, './help'),
          to: utils.formatPath('images/help'),
        },
        {
          from: path.resolve(imagesPath, './service-providers'),
          to: utils.formatPath('images/service-providers'),
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

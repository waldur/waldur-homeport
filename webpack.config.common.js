var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var scssPath = path.resolve(__dirname, './assets/sass');
var imagesPath = path.resolve(__dirname, './assets/images');
var extractPlugin = new ExtractTextPlugin({
  filename: 'css/[name]-bundle-[contenthash].css'
});
var momentLocalesPlugin = new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en-gb|et|ru|lt|lv)/);

module.exports = {
  entry: {
    index: './app/scripts/index.js',
    vendor: './app/scripts/vendor.js',
  },
  output: {
    path: path.resolve(__dirname, './app/static'),
    filename: 'js/[name]-bundle.js',
    chunkFilename: 'js/[name].[chunkhash].js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
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
            'css-loader?sourceMap',
            'postcss-loader?sourceMap',
            'sass-loader?sourceMap&includePaths[]=' + scssPath,
          ]
        }),
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap'
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
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery',
          },
          {
            loader: 'expose-loader',
            options: '$',
          },
        ],
      },
      {
        test: /datatables\.net.+\.js$/,
        use: [
          {
            loader: 'imports-loader',
            options: 'jQuery=jquery,$=jquery,define=>false,exports=>false'
          },
        ]
      },
    ],
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
      {from: './app/manifest.json', to: '../manifest.json', toType: 'file'},
    ]),
    new HtmlWebpackPlugin({
      template: './app/index-template.html',
      filename: '../index.html',
      inject: 'body',
      chunks: ['vendor', 'index'],
      chunksSortMode: function(a, b) {
         return (a.names[0] < b.names[0]) ? 1 : -1;
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

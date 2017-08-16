var baseConfig = require('./webpack.config.common.js');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
  devtool: 'inline-source-map',
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true,
  },
});

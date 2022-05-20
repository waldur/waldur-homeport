const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const target = isProd ? 'build' : 'build.dev';
const formatPath = (fragment) => path.resolve(`./${target}`, fragment);
const darkModeEnabledInDevEnv = true;

module.exports = { isProd, target, formatPath, darkModeEnabledInDevEnv };

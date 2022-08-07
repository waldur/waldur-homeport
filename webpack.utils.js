const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const target = isProd ? 'build' : 'build.dev';
const formatPath = (fragment) => path.resolve(`./${target}`, fragment);
const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = { isProd, target, formatPath, ASSET_PATH };

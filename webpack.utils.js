const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const target = isProd ? 'build' : 'build.dev';
const formatPath = fragment => path.resolve(`./${target}`, fragment);

const vendorManifest = './build.dll/vendor-manifest.json';
const vendorBundle = './build.dll/vendor.bundle.js';

module.exports = { isProd, target, formatPath, vendorManifest,  vendorBundle };

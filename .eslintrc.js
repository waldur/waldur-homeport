module.exports = {
  'env': {
    'browser': true,
    'es6': true
  },
  'plugins': [
    'react'
  ],
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'quotes': [
      'error',
      'single',
      {
        'allowTemplateLiterals': true
      }
    ],
    'semi': [
      'error',
      'always'
    ],
    'eol-last': [
      'error',
      'always'
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 2,
        'maxEOF': 1
      }
    ],
    'no-trailing-spaces': [
      'error'
    ],
    'no-console': [
      'warn'
    ],
    'quote-props': [
      'error',
      'as-needed',
      {
        keywords: false,
        unnecessary: true,
        numbers: false
      }
    ],
  },
  'globals': {
    gettext: true,
    angular: true,
    d3: true,
    $: true,
    Class: true,
    moment: true,
    jasmine: true,
    describe: true,
    expect: true,
    it: true,
    beforeEach: true,
    inject: true,
    process: true,
    require: true
  }
};

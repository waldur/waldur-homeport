'use strict';
/*jshint camelcase: false */

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    nggettext_extract: {
      pot: {
        files: {
          'i18n/template.pot': [
            'app/views/**/*.html',
            'app/scripts/components/**/*.html',
            'app/scripts/**/*.js',
          ]
        }
      },
    },
    po2json_angular_translate: {
      app: {
        options: {
          pretty: true
        },
        files: {
          'app/static/js/i18n/': ['i18n/*.po']
        }
      }
    },
  });
};

'use strict';
/*jshint camelcase: false */

var basePort = 8001,
  testPort = 8002;

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    sass: {
      dist: {
        options: {
          style: 'expanded',
          compass: false
        },
        files: {
          'assets/css/style.css': 'assets/sass/style.scss'
        }
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 10 version']
      },
      multiple_files: {
        expand: true,
        flatten: true,
        src: 'assets/css/*.css',
        dest: 'app/static/css/'
      }
    },

    cssmin: {
      combine: {
        files: {
          'app/static/css/style.min.css': [
            'app/static/css/bootstrap.min.css',
            'app/static/css/font-awesome.min.css',
            'app/static/css/style.css',
            'app/static/css/angular-flash.css',
            'app/static/css/select.css',
            'app/static/css/xeditable.css',
            'app/static/css/angular-block-ui.css',
            'app/static/css/leaflet.css',
            'app/static/css/flags16.css',
            'app/static/css/datatables/*.css',
            'app/static/css/bundle.min.css',
          ]
        }
      }
    },

    image: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'assets/images/',
          src: ['**/*.{png,jpg,gif,svg,ico}'],
          dest: 'app/static/images/'
        }]
      }
    },

    copy: {
      main: {
        files: [
          // front-end
          {
            expand: true,
            cwd: 'bower_components/fontawesome/fonts',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/fontawesome/css',
            src: ['font-awesome.min.css'],
            dest: 'app/static/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/open-sans-fontface/fonts/Semibold',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/open-sans-fontface/fonts/Bold',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/open-sans-fontface/fonts/Regular',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/open-sans-fontface/fonts/Light',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/dist/fonts/',
            src: ['*'],
            dest: 'app/static/fonts/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/html5shiv/dist',
            src: ['html5shiv.min.js'],
            dest: 'app/static/js/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/respond/dest',
            src: ['respond.min.js'],
            dest: 'app/static/js/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/world-flags-sprite/stylesheets/',
            src: ['flags16.css'],
            dest: 'app/static/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/world-flags-sprite/images/',
            src: ['flags16.png'],
            dest: 'app/static/images/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/bootstrap/dist/css/',
            src: ['bootstrap.min.css'],
            dest: 'app/static/css/',
            filter: 'isFile'
          },
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['index.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'app/static/css/',
            src: ['style.min.css'],
            dest: 'dist/static/css/',
            rename: function (dest) {
              return dest + 'app.css';
            }
          },
          {
            expand: true,
            cwd: 'app/static/js/main/',
            src: ['main.min.js'],
            dest: 'dist/static/js/',
            rename: function (dest) {
              return dest + 'app.js';
            }
          },
          {
            expand: true,
            cwd: 'app/views/',
            src: ['**'],
            dest: 'dist/views/',
          },
          {
            expand: true,
            cwd: 'app/static/js/i18n/',
            src: ['*.json'],
            dest: 'dist/static/js/i18n/'
          },
          {
            expand: true,
            cwd: 'app/static/images/',
            src: ['**'],
            dest: 'dist/static/images/'
          },
          {
            expand: true,
            cwd: 'app/static/fonts/',
            src: ['**'],
            dest: 'dist/static/fonts/'
          }
        ]
      }
    },

    protractor_webdriver: {
      options: {
        path: 'node_modules/protractor/bin/',
        command: 'webdriver-manager start --standalone'
      },
      test: {},
      daemonize: {
        options: {
          keepAlive: true
        }
      }
    },

    webpack: require('./webpack.config.js'),

    watch: {
      options: {
        livereload: true
      },
      sass: {
        files: ['assets/sass/*.scss', 'assets/sass/*/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          spawn: false,
          livereload: false,
        }
      },
      css: {
        files: ['app/static/css/*.css', '!app/static/css/style.min.css'],
        tasks: ['cssmin'],
      },
      autoprefixer: {
        files: 'assets/css/**',
        tasks: ['autoprefixer']
      },
      images: {
        files: ['assets/images/*.{png,jpg,gif}'],
        tasks: ['image'],
      },
      scripts: {
        files: 'app/scripts/**/*.js',
        tasks: ['concat', 'uglify'],
        options: {
          debounceDelay: 1000
        }
      },
      index: {
        files: 'app/index-template.html',
        tasks: ['preprocess:index']
      }
    },

    focus: {
      dev: {
        include: ['sass', 'autoprefixer', 'images', 'index']
      },
      prod: {
        include: ['sass', 'css', 'autoprefixer', 'images', 'scripts']
      }
    },

    connect: {
      options: {
        port: basePort,
        hostname: 'localhost',
        base: 'app'
      },
      server: {},
      dist: {
        options: {
          base: {
            path: 'dist'
          }
        }
      },
      test: {
        options: {
          base: {
            path: 'app',
            options: {
              index: 'test.html',
              maxAge: 300000
            }
          },
          port: testPort
        }
      }
    },

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

    concat: {
      build: {
        src: [
          'app/static/js/vendor-bundle.js',
          'app/static/js/datatables/pdfmake.min.js',
          'app/static/js/datatables/vfs_fonts.js',
          'app/scripts/class.js',
          'app/scripts/inspinia.js',
          'app/scripts/app.js',
          'app/scripts/utils.js',
          'app/scripts/configs/*.js',
          'app/scripts/controllers/*.js',
          'app/scripts/directives/*.js',
          'app/scripts/services/*.js',
          'app/static/js/index-bundle.js',
        ],
        dest: 'app/static/js/main/main.js'
      }
    },
    uglify: {
      options: {
        report: 'min',
        mangle: false
      },
      main: {
        files: {
          'app/static/js/main/main.min.js': ['app/static/js/main/main.js']
        }
      }
    },
    env: {
      dev: {
        NODE_ENV: 'DEVELOPMENT'
      },
      prod: {
        NODE_ENV: 'PRODUCTION'
      },
      test: {
        NODE_ENV: 'TEST',
        BROWSER: grunt.option('browser') || 'chrome'
      }
    },
    preprocess: {
      index: {
        src: 'app/index-template.html',
        dest: 'app/index.html'
      },
      test: {
        src: 'app/index-template.html',
        dest: 'app/test.html'
      }
    },

    protractor: {
      options: {
        configFile: "test/protractor.conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {}
      },
      test: {
        options: {
          args: {
            baseUrl: 'http://localhost:' + testPort
          }
        }
      },
      fasttest: {
        options: {
          args: {
            baseUrl: 'http://localhost:' + testPort
          }
        }
      },
    },
    // server for testing purposes
    express: {
      options: {
        // Override defaults here
        background: true
      },
      test: {
        options: {
          background: true,
          script: 'test/server.js'
        }
      }
    }

  });

  grunt.registerTask('build', [
    'copy:main',
    'image',
    'sass',
    'autoprefixer',
    'cssmin'
  ]);

  grunt.registerTask('run', [
    'po2json_angular_translate',
    'copy:main',
    'env:dev',
    'preprocess:index',
    'connect:server',
    'sass',
    'autoprefixer',
    'webpack:dev',
    'focus:dev'
  ]);

  grunt.registerTask('serve', ['connect',]);
  grunt.registerTask('default', ['run']);

  grunt.registerTask('prod', [
    'po2json_angular_translate',
    'copy:main',
    'env:prod',
    'preprocess:index',
    'connect:dist',
    'image',
    'sass',
    'autoprefixer',
    'webpack:prod',
    'concat',
    'uglify',
    'cssmin',
    'copy:dist',
    'focus:prod'
  ]);

  grunt.registerTask('prodbatch', [
    'po2json_angular_translate',
    'copy:main',
    'env:prod',
    'preprocess:index',
    'image',
    'sass',
    'autoprefixer',
    'webpack:prod',
    'concat',
    'uglify',
    'cssmin',
    'copy:dist',
  ]);

  // to run testing environment manually if needed. node server should be launched separately
  grunt.registerTask('runTest', [
    'copy:main',
    'env:test',
    'preprocess:test',
    'connect:test',
    'image',
    'sass',
    'autoprefixer',
    'focus:dev'
  ]);

  // old test task
  grunt.registerTask('test', [
    'copy:main',
    'env:test',
    'preprocess:test',
    'connect:test',
    'image',
    'sass',
    'autoprefixer',
    'express:test',
    'protractor:test'
  ]);
};

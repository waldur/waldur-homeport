'use strict';
/*jshint camelcase: false */

var basePort = 8001,
  testPort = 8002;

module.exports = function(grunt) {
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
                    // angular
                    {
                        expand: true,
                        cwd: 'bower_components/angular',
                        src: ['angular.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-loader',
                        src: ['angular-loader.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-ui-router/release',
                        src: ['angular-ui-router.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-cookies',
                        src: ['angular-cookies.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-resource',
                        src: ['angular-resource.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-scroll',
                        src: ['angular-scroll.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/satellizer/dist/',
                        src: ['satellizer.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-gravatar/build',
                        src: ['angular-gravatar.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-ui-select/dist/',
                        src: ['select.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-ui-select/dist/',
                        src: ['select.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/momentjs',
                        src: ['moment.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/d3',
                        src: ['d3.js'],
                        dest: 'app/static/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-moment',
                        src: ['angular-moment.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-flash-alert/src',
                        src: ['angular-flash.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-flash-alert/src',
                        src: ['angular-flash.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-animate',
                        src: ['angular-animate.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-translate',
                        src: ['angular-translate.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-translate-storage-cookie',
                        src: ['angular-translate-storage-cookie.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-translate-storage-local',
                        src: ['angular-translate-storage-local.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-translate-loader-static-files',
                        src: ['angular-translate-loader-static-files.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/ng-file-upload/',
                        src: ['ng-file-upload.js'],
                        dest: 'app/static/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angulartics/src',
                        src: ['angulartics.js'],
                        dest: 'app/static/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angulartics/src',
                        src: ['angulartics-ga.js'],
                        dest: 'app/static/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-xeditable/dist/js/',
                        src: ['xeditable.js'],
                        dest: 'app/static/js/angular',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-xeditable/dist/css/',
                        src: ['xeditable.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-block-ui/dist/',
                        src: ['angular-block-ui.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-block-ui/dist/',
                        src: ['angular-block-ui.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-sanitize/',
                        src: ['angular-sanitize.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/leaflet/dist/',
                        src: ['leaflet.js'],
                        dest: 'app/static/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/leaflet/dist/',
                        src: ['leaflet.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-leaflet-directive/dist/',
                        src: ['angular-leaflet-directive.js'],
                        dest: 'app/static/js/angular/',
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
                    {
                        expand: true,
                        cwd: 'bower_components/angular-bootstrap/',
                        src: ['ui-bootstrap-tpls.min.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/jquery/dist/',
                        src: ['jquery.min.js'],
                        dest: 'app/static/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/slimScroll/',
                        src: ['jquery.slimscroll.min.js'],
                        dest: 'app/static/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/angular-slimscroll/',
                        src: ['angular-slimscroll.js'],
                        dest: 'app/static/js/angular/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/jszip/dist/',
                        src: ['jszip.min.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/pdfmake/build/',
                        src: ['pdfmake.min.js', 'vfs_fonts.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net/js/',
                        src: ['jquery.dataTables.min.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-bs/js/',
                        src: ['dataTables.bootstrap.min.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-bs/css/',
                        src: ['dataTables.bootstrap.min.css'],
                        dest: 'app/static/css/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-buttons/js/',
                        src: [
                            'dataTables.buttons.min.js',
                            'buttons.html5.min.js',
                            'buttons.print.min.js'
                        ],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-buttons-bs/css/',
                        src: ['buttons.bootstrap.min.css'],
                        dest: 'app/static/css/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-buttons-bs/js/',
                        src: ['buttons.bootstrap.min.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-responsive/js/',
                        src: ['dataTables.responsive.min.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-responsive-bs/js/',
                        src: ['responsive.bootstrap.js'],
                        dest: 'app/static/js/datatables/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/datatables.net-responsive-bs/css/',
                        src: ['responsive.bootstrap.min.css'],
                        dest: 'app/static/css/datatables/',
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
                        rename: function(dest) {
                            return dest + 'app.css';
                        }
                    },
                    {
                        expand: true,
                        cwd: 'app/static/js/main/',
                        src: ['main.min.js'],
                        dest: 'dist/static/js/',
                        rename: function(dest) {
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
                    'app/scripts/components/**/*.html'
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
                    'app/static/js/jquery.min.js',
                    'app/static/js/angular/angular.js',
                    'app/static/js/angular/angular-animate.js',
                    'app/static/js/angular/angular-cookies.js',
                    'app/static/js/angular/angular-flash.js',
                    'app/static/js/angular/angular-loader.js',
                    'app/static/js/angular/angular-gravatar.js',
                    'app/static/js/angular/moment.js',
                    'app/static/js/angular/angulartics.js',
                    'app/static/js/angular/angulartics-ga.js',
                    'app/static/js/angular/angular-moment.js',
                    'app/static/js/angular/angular-resource.js',
                    'app/static/js/angular/angular-scroll.js',
                    'app/static/js/angular/angular-ui-router.js',
                    'app/static/js/angular/select.js',
                    'app/static/js/angular/satellizer.js',
                    'app/static/js/angular/angular-translate.js',
                    'app/static/js/angular/angular-translate-storage-cookie.js',
                    'app/static/js/angular/angular-translate-storage-local.js',
                    'app/static/js/angular/angular-translate-loader-static-files.js',
                    'app/static/js/angular/ng-file-upload.js',
                    'app/static/js/angular/xeditable.js',
                    'app/static/js/angular/angular-sanitize.js',
                    'app/static/js/d3.js',
                    'app/scripts/class.js',
                    'app/scripts/inspinia.js',
                    'app/scripts/app.js',
                    'app/scripts/utils.js',
                    'app/scripts/configs/*.js',
                    'app/scripts/controllers/*.js',
                    'app/scripts/directives/*.js',
                    'app/scripts/services/*.js',
                    'app/static/js/angular/angular-block-ui.js',
                    'app/static/js/leaflet.js',
                    'app/static/js/angular/angular-leaflet-directive.js',
                    'app/static/js/angular/ui-bootstrap-tpls.min.js',
                    'app/static/js/jquery.slimscroll.min.js',
                    'app/static/js/angular/angular-slimscroll.js',
                    'app/static/js/datatables/jszip.min.js',
                    'app/static/js/datatables/pdfmake.min.js',
                    'app/static/js/datatables/vfs_fonts.js',
                    'app/static/js/datatables/jquery.dataTables.min.js',
                    'app/static/js/datatables/dataTables.bootstrap.min.js',
                    'app/static/js/datatables/dataTables.buttons.min.js',
                    'app/static/js/datatables/buttons.html5.min.js',
                    'app/static/js/datatables/buttons.print.min.js',
                    'app/static/js/datatables/buttons.bootstrap.min.js',
                    'app/static/js/datatables/dataTables.responsive.min.js',
                    'app/static/js/datatables/responsive.bootstrap.js',
                    'app/static/js/bundle.js',
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

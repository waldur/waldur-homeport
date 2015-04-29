/*jshint camelcase: false */

var basePort = 8001,
    testPort = 8002;

module.exports = function(grunt) {

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
                    'app/static/css/style.min.css': ['app/static/css/style.css']
                }
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'assets/images/',
                    src: ['**/*.{png,jpg,gif}'],
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
                        cwd: 'bower_components/normalize.css',
                        src: ['normalize.css'],
                        dest: 'app/static/css/',
                        filter: 'isFile'
                    },
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
                        cwd: 'bower_components/satellizer',
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
                    }
                ],
            },
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

        protractor: {
            options: {
                configFile: 'test/protractor.conf.js', // Default config file
                keepAlive: false, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
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
                        baseUrl: 'http://localhost:' + basePort
                    }
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            css: {
                files: ['assets/sass/*.scss', 'assets/sass/*/*.scss'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    spawn: false,
                    livereload: false,
                }
            },
            autoprefixer: {
                files: 'assets/css/**',
                tasks: ['autoprefixer']
            },
            images: {
                files: ['assets/images/*.{png,jpg,gif}'],
                tasks: ['imagemin'],
            }
        },

        connect: {
            options: {
                port: basePort,
                hostname: 'localhost',
                base: 'app'
            },
            server: {},
            test: {
                options: {
                    port: testPort,
                }
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask(
        'build', ['copy', 'imagemin', 'sass', 'autoprefixer', 'cssmin']);
    grunt.registerTask(
        'run', ['copy', 'connect:server', 'imagemin', 'sass', 'autoprefixer', 'watch']);
    grunt.registerTask('serve', ['connect',]);
    grunt.registerTask('default', ['run']);
    grunt.registerTask('test',
        ['connect:test', 'imagemin', 'sass', 'autoprefixer', 'protractor_webdriver:test', 'protractor:test']);

};

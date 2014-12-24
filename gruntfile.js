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

        concat: {
            dist: {
                src: [
                    'assets/js/libs/jquery.js',
                    'assets/js/libs/bootstrap.js',
                    'assets/js/scripts.js'
                ],
                dest: 'app/static/js/production.js',
            }
        },

        uglify: {
            build: {
                src: 'app/static/js/production.js',
                dest: 'app/static/js/production.min.js',
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

        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['assets/js/*.js'],
                tasks: ['concat'],
                options: {
                    spawn: false,
                }
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
                port: 8000,
                hostname: 'localhost'
            },
            server: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
                            connect.static('./app')
                        ];
                    }
                }
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['concat', 'uglify', 'imagemin', 'sass', 'autoprefixer', 'cssmin']);
    grunt.registerTask('run', ['connect', 'concat', 'imagemin', 'sass', 'autoprefixer', 'watch']);
    grunt.registerTask('serve', ['connect',]);
    grunt.registerTask('default', ['run']);
    grunt.registerTask('test', ['karma']);

};

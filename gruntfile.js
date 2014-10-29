module.exports = function(grunt) {

    grunt.initConfig({

        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    compass: false
                },
                files: {
                    'dev/css/style.css': 'dev/sass/style.scss'
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
                src: 'dev/css/*.css',
                dest: 'static/css/'
            }
        },

        cssmin: {
            combine: {
                files: {
                    'static/css/style.min.css': ['static/css/style.css']
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'dev/js/libs/jquery.js',
                    'dev/js/libs/bootstrap.js',
                    'dev/js/scripts.js'
                ],
                dest: 'static/js/production.js',
            }
        },

        uglify: {
            build: {
                src: 'static/js/production.js',
                dest: 'static/js/production.min.js',
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'dev/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'static/images/'
                }]
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            scripts: {
                files: ['dev/js/*.js'],
                tasks: ['concat'],
                options: {
                    spawn: false,
                }
            },
            css: {
                files: ['dev/sass/*.scss', 'dev/sass/*/*.scss'],
                tasks: ['sass', 'autoprefixer'],
                options: {
                    spawn: false,
                    livereload: false,
                }
            },
            autoprefixer: {
                files: 'dev/css/**',
                tasks: ['autoprefixer']
            },
            images: {
                files: ['dev/images/*.{png,jpg,gif}'],
                tasks: ['imagemin'],
            }
        },

        connect: {
            server: {
                options: {
                    post: 8000, 
                    base: './production/'
                }
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['concat', 'uglify', 'imagemin', 'sass', 'autoprefixer', 'cssmin']);
    grunt.registerTask('run', ['concat', 'imagemin', 'sass', 'autoprefixer', 'watch']);
    grunt.registerTask('serve', ['connect',]);
    grunt.registerTask('default', ['run'])

};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        seperator: ';'
      },
      dist: {
        src: ['src/data.js', 'src/*.js'],
        dest: 'build/concat.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/concat.js',
        dest: 'build/<%= pkg.version %>/<%= pkg.name %>.min.js'
      }
    },
    clean: {
      concat: {
        src: 'build/concat.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: 'src/*.js'
    },
    jasmine: {
      prebuild: {
        src: 'build/concat.js',
        options: {
          specs: 'spec/*Spec.js',
          helpers: 'spec/*Helper.js'
        }
      },
      postbuild: {
        src: 'build/<%= pkg.version %>/<%= pkg.name %>.min.js',
        options: {
          specs: 'spec/*Spec.js',
          helpers: 'spec/*Helper.js'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'jasmine:prebuild', 'uglify', 'clean:concat', 'jasmine:postbuild']);
  grunt.registerTask('test', ['jshint', 'concat', 'jasmine:prebuild', 'clean:concat']);

};
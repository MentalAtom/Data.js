module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json'),
      licenseURL = pkg.licenses[0].url;

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    licenseURL: pkg.licenses[0].url,
    concat: {
      options: {
        seperator: ';'
      },
      dist: {
        src: ['src/data.js', 'src/shim.js', 'src/*.js'],
        dest: 'build/concat.js'
      }
    },
    uglify: {
      modern: {
        options: {
          banner: '/*!\n <%= pkg.name %> - v<%= pkg.version %> | Build Date: <%= grunt.template.today("yyyy-mm-dd") %> \n (c) 2013 Matt Malone | <%= licenseURL %>\n*/\n'
        },
        src: 'build/concat.js',
        dest: 'build/<%= pkg.version %>/<%= pkg.name %>.min.js'
      },
      retro: {
        options: {
          banner: '/*!\n <%= pkg.name %> - v<%= pkg.version %> | Build Date: <%= grunt.template.today("yyyy-mm-dd") %> \n (c) 2013 Matt Malone | <%= licenseURL %>\n Contains JSON2.js | https://github.com/douglascrockford/JSON-js*/\n'
        },
        src: ['build/json2.js', 'build/concat.js'],
        dest: 'build/<%= pkg.version %>/<%= pkg.name %>.ie7.min.js'
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
    },
    watch: {
      scripts: {
        files: 'src/*.js',
        tasks: ["concat"]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'jasmine:prebuild', 'uglify:modern', 'uglify:retro', 'clean:concat', 'jasmine:postbuild']);
  grunt.registerTask('test', ['jshint', 'concat', 'jasmine:prebuild']);

};
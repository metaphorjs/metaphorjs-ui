
var fs = require("fs");

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.initConfig({
        watch: {
            css: {
                files: ['src-theme/semanic-ui/scss/**/*.scss'],
                tasks: ['css']
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    require("./src-theme/semantic-ui/grunt.js")(grunt);

    grunt.registerTask("default",
        ["semantic-ui"]
    );
};
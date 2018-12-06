

module.exports = function(grunt) {

    grunt.config.merge({
        sass: {
            options: {
                sourceMap: false
            },
            dist:    {
                files: [
                    {
                        expand: true,
                        cwd:    "src-theme/semantic-ui/scss",
                        src:    ["**/*.scss"],
                        dest:   "src-theme/semantic-ui/css/",
                        ext:    ".css"
                    }
                ]
            }
        },
        autoprefixer: {
            options:        {
                browsers: ["> 0%"]
            },
            // prefix all files
            multiple_files: {
                expand: true,
                cwd:    "src-theme/semantic-ui/css",
                src:    '**/*.css',
                dest:   'src-theme/semantic-ui/css/'
            }
        },
        concat_css: {
            all: {
                src: [
                    "src-theme/semantic-ui/css/**/*.css"
                ],
                dest: "src-theme/semantic-ui/dist/overrides.css"
            }
        }
    });

    grunt.registerTask('semantic-ui',
        ['sass', 'autoprefixer', 'concat_css']);
};
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var rename = require('gulp-rename');
var modRewrite = require('connect-modrewrite');
var gulp = require('gulp');

var config = {
    paths: {
        scripts: ['./src/**/*.js'],
        less: './src/**/*.less'
    }
};

gulp.task('build', ['build-js', 'build-less'], function() {
});

// Build
gulp.task('build-js', function() {
    return gulp.src(config.paths.scripts)
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('dist/'));
});

// Build
gulp.task('build-less', function() {
    return gulp.src(config.paths.less)
        .pipe(less())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('dist/'));
});

// Lint
gulp.task('lint', function() {
    return gulp.src(config.paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(config.paths.scripts, ['lint']);
});

// Serve
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: './',
            middleware: [
                modRewrite([
                    '^/$ /demo/demo.html'
                ])
            ]
        }
    });

    gulp.watch('*.html').on('change', browserSync.reload);
});

gulp.task('default', ['serve']);

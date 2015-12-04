var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var bump = require('gulp-bump');
var header = require('gulp-header');
var less = require('gulp-less');
var rename = require('gulp-rename');
var modRewrite = require('connect-modrewrite');
var runSequence = require('run-sequence');
var argv = require('yargs').argv;

var config = {
    paths: {
        scripts: ['./src/**/*.js'],
        less: './src/**/*.less',
        demo: {
            less: './demo/**/*.less'
        }
    }
};

gulp.task('build', ['build-js', 'build-less'], function() {
});

// Build
gulp.task('build-js', function() {
    var pkg = require('./package.json');
    var banner = ['/**',
        ' * <%= pkg.name %>',
        ' * ',
        ' * <%= pkg.description %>',
        ' * ',
        ' * @author <%= pkg.author %>',
        ' * @version v<%= pkg.version %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n');

    return gulp.src(config.paths.scripts)
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(header(banner, { pkg : pkg } ))
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

gulp.task('release', function(cb) {
    runSequence('bump', 'build', cb);
});

// Bump
gulp.task('bump', function() {
    var bumpOpts = {};

    if ('v' in argv) {
        bumpOpts.type = argv.v;
    }

    return gulp.src(['./package.json'])
        .pipe(bump(bumpOpts))
        .pipe(gulp.dest('./'));
});

// Demo
gulp.task('demo', function() {
    return gulp.src(config.paths.demo.less)
        .pipe(less())
        .pipe(rename({
            extname: '.css'
        }))
        .pipe(gulp.dest('demo/'));
});

// Lint
gulp.task('lint', function() {
    return gulp.src(config.paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Watch
gulp.task('watch', function() {
    gulp.watch(config.paths.scripts, ['lint', 'build-js']);
    gulp.watch(config.paths.less, ['build-less']);
    gulp.watch(config.paths.demo.less, ['demo']);
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

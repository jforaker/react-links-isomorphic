var gulp       = require('gulp'),
    browserify = require('gulp-browserify'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass');

gulp.task('scripts', function () {

    gulp.src(['app/main.js'])
        .pipe(browserify({
            debug: true,
            transform: [ 'reactify' ]
        }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('sass', function () {
    gulp.src('./public/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('./public'))
        .pipe(livereload());
});

gulp.task('watch', function () {
    gulp.watch('./app/**/*.js', ['scripts']);
    gulp.watch('./public/*.scss', ['sass']);
});

gulp.task('default', ['watch']);


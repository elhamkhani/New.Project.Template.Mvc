/// <vs AfterBuild='less-to-css' />
var gulp = require('gulp');
var debug = require('gulp-debug');
var onlyChangedFiles = require('gulp-changed');
var less = require('gulp-less');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglifyjs');
var xmlpoke = require('gulp-xmlpoke');
var clean = require('gulp-clean');
var rename = require('gulp-rename');

// prepare LESS files
gulp.task('less-to-css', function () {
    return gulp
        .src('./Styles/*.less')
        .pipe(debug({ title: 'less:' }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest('./Styles/'));
});

gulp.task('less-to-css-min', function () {
    return gulp
        .src('./Styles/*.less')
        .pipe(debug({ title: 'less:' }))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(rename({ suffix: "-min" }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest('./public/css'));
});

// transform web.config
function updateDebugMode(mode) {
    return gulp
        .src('./Web.config')
        .pipe(xmlpoke({
            replacements: [{
                xpath: "//system.web/compilation/@debug",
                value: mode
            }]
        }))
        .pipe(gulp.dest('./'));
}

gulp.task('enable-debug-mode', function () { return updateDebugMode("true") });
gulp.task('disable-debug-mode', function () { return updateDebugMode("false") });

// prepare JS files
function getScriptFiles() {
    var content = require('fs').readFileSync('./ScriptReferences.json', 'utf8');
    // strip BOM
    content = content.replace(/^\uFEFF/, '');
    var files = JSON.parse(content);
    // make paths relative to gulp
    files = files.map(function (f) { return '.' + f });

    return files;
}

gulp.task('uglify-js', ['clean-destination-js'], function () {
    return gulp.src(getScriptFiles())
        .pipe(uglify('app-min.js', { outSourceMap: true }))
        .pipe(gulp.dest('./public/js'));
});

// prepare modernizr separately
gulp.task('uglify-modernizr', function () {
    return gulp
        .src('./bower_components/modernizr/modernizr.js')
        .pipe(uglify('modernizr-min.js', { outSourceMap: true }))
        .pipe(gulp.dest('./public/js'));
});

// copy font files
gulp.task('fonts', function () {
    return gulp
        .src(['./bower_components/bootstrap/dist/fonts/*.*', './bower_components/fontawesome/fonts/*.*'])

        .pipe(onlyChangedFiles('./public/fonts'))
        .pipe(debug({ title: 'font:' }))
        .pipe(gulp.dest('./public/fonts'));
});

// cleanup

gulp.task('clean-destination-js', function () {
    return gulp
        .src([
              './public/js/*.js',
              './public/js/*.js.map'],
              { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('clean-css', function () {
    return gulp
        .src([
             './public/css/*.css',
              './public/css/*.css.map',
              './Styles/*.css',
              './Styles/*.css.map',
              './Styles/Imports/*.css',
              './Styles/Imports/*.css.map'],
              { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('clean-fonts', function () {
    return gulp
        .src(['./public/fonts/*.eot',
              './public/fonts/*.svg',
              './public/fonts/*.ttf',
              './public/fonts/*.woff',
              './public/fonts/*.woff2'],
              { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('prepare-release', ['less-to-css-min', 'fonts', 'uglify-js', 'uglify-modernizr']);
gulp.task('Clean', ['clean-destination-js', 'clean-css', 'clean-fonts']);
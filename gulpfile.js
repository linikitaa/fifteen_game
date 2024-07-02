const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const browserSync = require('browser-sync').create()
const clean = require('gulp-clean')

function scripts() {
    return src('app/js/index.js')
        .pipe(concat('index.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(concat('style.min.css'))
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/style.scss'], styles)
    watch(['app/js/index.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload)
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    })
}

function cleanDist() {
    return src('dist')
        .pipe(clean())
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/js/index.min.js',
        'app/**/*.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = series(cleanDist, building)
exports.default = parallel(styles, scripts, browsersync, watching)
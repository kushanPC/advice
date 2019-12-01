'use strict';

const gulp = require('gulp');
const njkRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const prettify = require('gulp-html-beautify');
const watch = require('gulp-watch');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const cssmin = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

const path = {
    build: { //куда выплюнуть
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        njk: 'build/'
    },
    src: { //исходники
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        njk: 'src/nunjucks/index.njk'
    },
    watch: { // наблюдение
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        njk: 'src/nunjucks/**/*.njk'
    },
    clean: './build'
};


const config = {
    server: {
        baseDir: './build'
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: 'Frontend_Devil'
};


gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger()) // rigger
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true }));
});


gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
});



gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});


gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});



gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});


gulp.task('nunjucks', function() {
  return gulp.src(path.src.njk)
  // Adding data to Nunjucks
  .pipe(data(function () {
    return require('./src/data.json')
  }))
  .pipe(njkRender())
  .pipe(prettify({
    indent_size : 4
  }))
  .pipe(gulp.dest(path.build.njk))
  .pipe(reload({stream: true}))
});


gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'nunjucks'
]);



gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
        gulp.start('nunjucks');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    gulp.watch([path.watch.njk], ['nunjucks']);
});


gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('default', ['build','nunjucks', 'webserver', 'watch']);

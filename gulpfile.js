'use strict';

var gulp = require('gulp');
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var streamseries = require('stream-series');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var escape = require('escape-html');
var browserSync = require('browser-sync');
var eslint = require('eslint');
var argv = require('yargs').argv;

var isProduction = ((argv._.indexOf('deploy') > -1) || (argv._.indexOf('stage') > -1) ? true : argv.prod);

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

gulp.task('clean:assets', function () {
  return $.del([
    'js/**/*.min.js',
    'css/**/*.min.css'
  ]);
});
gulp.task('clean:dist', function () {
  return $.del([
    '_site/**/*'
  ]);
});
gulp.task('clean', ['clean:assets', 'clean:dist']);

gulp.task('data', function (done) {
  spawn('node', ['get_data.js'], {
    stdio: 'inherit'
  })
  .on('exit', function (code) {
    done(code === 0 ? null : 'ERROR: getting data from Google Drive failed with code: ' + code);
  });
});

gulp.task('fonts', function () {
  return gulp.src([
    'bower_components/font-awesome/fonts/*',
    'bower_components/font-mfizz/fonts/*'
  ]).pipe(gulp.dest('assets/fonts'));
});

// gulp.task('images', require('./gulp-tasks/images')(gulp, $));

gulp.task('jekyll', function (done) {
  spawn('bundle', ['exec', jekyll, 'build'], {
    stdio: 'inherit'
  })
  .on('exit', function (code) {
    done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('scripts:vendor', function () {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/animated-header/js/animated-header.js',
    'bower_components/FitText.js/jquery.fittext.js',
    'bower_components/jquery.easing/js/jquery.easing.min.js',
    'bower_components/wow/dist/wow.min.js',
    'bower_components/tether/dist/js/tether.js',
    'bower_components/bootstrap/dist/js/bootstrap.js',
    'bower_components/jquery.serializeJSON/jquery.serializejson.min.js',
    'bower_components/bootstrap-validator/dist/validator.min.js'
    // 'bower_components/bootstrap/dist/js/umd/scrollspy.js'
  ])
  .pipe($.sourcemaps.init())
  .pipe($.concat('vendor.js'))
  .pipe($.rename({suffix: '.min'}))
  .pipe($.if(isProduction, $.if('*.js', $.uglify({preserveComments: 'some'}))))
  .pipe($.if(isProduction, $.size({
    title: 'minified vendor scripts',
    showFiles: true
  })))
  .pipe($.if(!isProduction, $.sourcemaps.write('.')))
  .pipe($.if(isProduction, gulp.dest('js/')))
  .pipe($.if(isProduction, $.if('*.js', $.gzip({append: true}))))
  .pipe($.if(isProduction, $.size({
    title: 'gzipped vendor scripts',
    gzip: true,
    showFiles: true
  })))
  .pipe(gulp.dest('js/'))
  .pipe($.if(!isProduction, browserSync.stream()));
});
// gulp.task('scripts', scripts.scripts);
// gulp.task('serve', require('./gulp-tasks/serve')(gulp, $, browserSync));
// var styles = require('./gulp-tasks/styles')(gulp, $, isProduction, browserSync, autoprefixer);
// gulp.task('styles', styles.styles);
// gulp.task('styles:vendor', styles.vendor);

// 'gulp lint' -- check your JS for formatting errors using XO Space
gulp.task('lint', () =>
gulp.src([
  'gulpfile.babel.js',
  '.tmp/assets/javascript/*.js',
  '!.tmp/assets/javascript/*.min.js'
])
.pipe(eslint())
.pipe(eslint.formatEach())
.pipe(eslint.failOnError())
);

// 'gulp assets' -- cleans out your assets and rebuilds them
// 'gulp assets --prod' -- cleans out your assets and rebuilds them with
// production settings
gulp.task('assets', [
  'clean:assets'
  // 'styles:vendor', 'styles', 'scripts:vendor', 'scripts', 'fonts', 'images', 'data'
]);

// 'gulp assets:copy' -- copes the assets into the dist folder, needs to be
// done this way because Jekyll overwrites the whole folder otherwise
gulp.task('assets:copy', () =>
gulp.src('.tmp/assets/**/*')
.pipe(gulp.dest('dist/assets'))
);

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
gulp.task('build', [
  'clean:assets',
  'assets',
  'jekyll',
  'assets:copy'
]);

// // 'gulp deploy:push' -- pushes your dist folder to Github
// gulp.task('deploy:push', () => {
//   return gulp.src('dist#<{(||)}>#*')
//   .pipe($.ghPages({
//     branch: 'master',
//     remoteUrl: 'git@github.com:GCDigitalFellows/gcdigitalfellows.github.io.git'
//   }));
// });
//
// // 'gulp deploy' -- copies CNAME and pushes to github
// gulp.task('deploy', gulp.start(
//   'build',
//   // 'deploy:cname',
//   'deploy:push'
// ));

// 'gulp' -- cleans your assets and gzipped files, creates your assets and
// injects them into the templates, then builds your site, copied the assets
// into their directory and serves the site
// 'gulp --prod' -- same as above but with production settings
gulp.task('default', [
  'build',
  'serve'
]);


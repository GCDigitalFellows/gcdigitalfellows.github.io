'use strict';

var gulp = require('gulp');
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var spawn = require('child_process').spawn;
var browserSync = require('browser-sync');
var eslint = require('eslint');
var argv = require('yargs').argv;
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');
var del = require('del');

var isProduction = argv.nomin;

var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

gulp.task('clean:assets', function () {
  return del([
    'js/**/*.min.js',
    'css/**/*.map',
    'css/**/*.css'
  ]);
});
gulp.task('clean:dist', function () {
  return del([
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
  ]).pipe(gulp.dest('fonts'));
});

// gulp.task('images', require('./gulp-tasks/images')(gulp, $));

gulp.task('jekyll', function (done) {
  spawn('bundle', ['exec', jekyll, 'build', '--incremental'], {
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
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe($.if(isProduction, gulp.dest('js')))
    .pipe($.if(isProduction, $.if('*.js', $.gzip({append: true}))))
    .pipe(gulp.dest('js'))
    .pipe(gulp.dest('_site/js'))
    .pipe($.if(!isProduction, browserSync.stream()));
});

gulp.task('scripts', function () {
  return gulp.src('js/main.js')
    .pipe($.if(!isProduction, $.sourcemaps.init()))
    .pipe($.concat('main.min.js'))
    .pipe($.if(isProduction, $.uglify({preserveComments: 'some'})))
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe($.if(isProduction, $.gzip({append: true})))
    .pipe(gulp.dest('js/'))
    .pipe(gulp.dest('_site/js'))
    .pipe($.if(!isProduction, browserSync.stream()));
});

gulp.task('styles', function () {
  return gulp.src('_sass/style.scss')
    .pipe($.if(!isProduction, $.sourcemaps.init()))
    .pipe($.sass({
      precision: 10,
      includePaths: ['bower_components/bootstrap/scss']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browsers: 'last 1 version'}),
      mqpacker,
      csswring
    ]))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.if(!isProduction, $.sourcemaps.write('.')))
    .pipe($.if(isProduction, $.gzip({append: true})))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('_site/css'))
    .pipe($.if(!isProduction, browserSync.stream()));
});

gulp.task('styles:vendor', function () {
  return gulp.src([
    'bower_components/animate.css/animate.min.css',
    // 'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    'bower_components/font-mfizz/css/font-mfizz.css'
  ])
  .pipe($.if(!isProduction, $.sourcemaps.init()))
  .pipe($.concat('vendor.min.css'))
  .pipe($.postcss([
    autoprefixer({browsers: 'last 1 version'}),
    mqpacker,
    csswring
  ]))
  .pipe($.if(!isProduction, $.sourcemaps.write('.')))
  .pipe($.if(isProduction, $.if('*.min.css', $.gzip({append: true}))))
  .pipe(gulp.dest('css'))
  .pipe(gulp.dest('_site/css'))
  .pipe($.if(!isProduction, browserSync.stream()));
});
gulp.task('serve', function (done) {
  browserSync({
    server: {
      baseDir: ['_site']
    }
  });

  gulp.watch([
    './**/*.md',
    './**/*.markdown',
    './**/*.html',
    './**/*.yml',
    './**/*.json',
    './**/*.txt',
    '!_site/*'
  ], [
    'jekyll',
    browserSync.reload
  ]);
  gulp.watch(['js/**/*.js'], ['scripts', browserSync.reload]);
  gulp.watch('_scss/**/*.{scss,sass}', ['styles', browserSync.reload]);
  gulp.watch('images/**/*', browserSync.reload);
  done();
});

// 'gulp lint' -- check your JS for formatting errors using XO Space
gulp.task('lint', () =>
gulp.src([
  'gulpfile.babel.js',
  'js/**/*.js',
  '!js/**/*.min.js'
])
.pipe(eslint())
.pipe(eslint.formatEach())
.pipe(eslint.failOnError())
);

// 'gulp assets' -- cleans out your assets and rebuilds them
// 'gulp assets --prod' -- cleans out your assets and rebuilds them with
// production settings
gulp.task('assets', [
  'clean:assets',
  'styles:vendor',
  'styles',
  'scripts:vendor',
  'scripts',
  'fonts',
  // 'images',
  'data'
]);

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
gulp.task('build', [
  'clean:assets',
  'assets',
  'jekyll'
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


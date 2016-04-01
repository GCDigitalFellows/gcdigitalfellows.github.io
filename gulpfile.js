'use strict';

var gulp = require('gulp');
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();
var spawn = require('child_process').spawn;
var argv = require('yargs').argv;
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');
var del = require('del');
var browserSync = require('browser-sync');
var commandExists = require('command-exists');

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

gulp.task('images', function () {
  return gulp.src(['_images/*'])
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [
        {removeViewBox: false},
        {cleanupIDs: false}
      ]
    }))
    .pipe(gulp.dest('images'))
    .pipe(gulp.dest('_site/images/'));
});

gulp.task('jekyll', function (done) {
  commandExists('bundle', function (err, commandExists) {
    if (err !== null) {
      console.log(err);
    } else if (commandExists) {
      console.log('Starting Jekyll using Bundler');
      spawn('bundle', ['exec', jekyll, 'build'], {stdio: 'inherit'})
      .on('exit', function (code) {
        done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
      });
    } else {
      console.log('Starting Jekyll without Bundler');
      spawn(jekyll, ['build'], {stdio: 'inherit'})
      .on('exit', function (code) {
        done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
      });
    }
  });
});

gulp.task('jekyll:incremental', function (done) {
  commandExists('bundle', function (err, commandExists) {
    if (err !== null) {
      console.log(err);
    } else if (commandExists) {
      console.log('Compiling Jekyll incrementally using Bundler');
      spawn('bundle', ['exec', jekyll, 'build', '--incremental'], {stdio: 'inherit'})
      .on('exit', function (code) {
        done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
      });
    } else {
      console.log('Compiling Jekyll incrementally without Bundler');
      spawn(jekyll, ['build', '--incremental'], {stdio: 'inherit'})
      .on('exit', function (code) {
        done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
      });
    }
  });
});

// 'gulp lint' -- check your JS for formatting errors using XO Space
gulp.task('lint', () =>
  gulp.src([
    'gulpfile.babel.js',
    'js/**/*.js',
    '!js/**/*.min.js'
  ])
  .pipe($.eslint())
  .pipe($.eslint.formatEach())
  .pipe($.eslint.failOnError())
);

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

gulp.task('scripts:vendor', function () {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/animated-header/js/animated-header.js',
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
  'images',
  'data'
]);

// 'gulp build' -- same as 'gulp' but doesn't serve your site in your browser
// 'gulp build --prod' -- same as above but with production settings
gulp.task('build', [
  'assets',
  'jekyll'
]);

var browserSyncConfig = {
  server: {
    baseDir: ['_site']
  },
  open: true,
  browser: [
    // 'safari',
    // 'firefox',
    'chrome'
  ]
};

gulp.task('serve', ['build'], () => {
  browserSync(browserSyncConfig);

  // Jekyll
  gulp.watch([
    '_config.yml',
    '**/*.md',
    '**/*.markdown',
    '**/*.html',
    '_data/yml',
    '_data/*.json',
    '!_site/',
    '!_js/',
    '!_css/',
    '!_scss/',
    '!images/',
    '!_images/',
    '!bower_components/',
    '!node_modules/'
  ], {interval: 500}, [
    'jekyll:incremental',
    browserSync.reload
  ]);

  // Assets
  gulp.watch(['js/**/*.js'], {interval: 500}, ['scripts', browserSync.reload]);
  gulp.watch(['_sass/**/*.{scss,sass}'], {interval: 500}, ['styles', browserSync.reload]);
  gulp.watch(['_images/**/*'], {interval: 500}, ['images', browserSync.reload]);
});

// 'gulp' -- cleans your assets and gzipped files, creates your assets and
// injects them into the templates, then builds your site, copied the assets
// into their directory and serves the site
gulp.task('default', ['serve']);


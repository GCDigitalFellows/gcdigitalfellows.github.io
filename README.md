# GC Digital Research Bootcamp

## Prerequisites

You need a few tools installed to build and run this website:
 0. Install git
 1. Install [nodejs](https://nodejs.org/en/), you might need v5+
 2. Install gulp 4.0:
   * uninstall gulp if you already have it installed: `npm uninstall gulp -g`
   * install gulp `npm install -g gulpjs/gulp-cli#4.0 gulpjs/gulp#4.0`
 3. Make sure you have python installed (needs version 2.x)
   * install pyyaml `pip install pyyaml`
   * Feel free to set up a virtualenv for this project. Python's only used to collect data from google docs. I probably should've written those scripts in ruby, but oh well...
 4. Make sure you have ruby, [rubygems](https://rubygems.org/pages/download), and [bundler](http://bundler.io/) installed.

Now you're ready to clone and install:
 1. clone this repo: `git clone https://github.com/GCDigitalFellows/gcdrb.git`
 2. `cd gcdrb`
 3. `npm install && bower install && bundle install`
 4. Clean your room. Or something. It's going to take a minute to download and install all of the dependencies
 5. If any of the previous commands failed, try running them again. The npm command sometimes needs to be run multiple times to catch all of the dependencies.

## Run the Site Locally

```sh
$ gulp
```

This should download the data files, compile all of the code, and open a browser to the site hosted at [http://localhost:3000](http://localhost:3000). It will also spawn an instance of browsersync at [http://localhost:3001](http://localhost:3001), which will allow you to debug the site in realtime.

## Additional Commands

Build all of the files but don't launch the server:

```sh
$ gulp build
```

Build the site for production (necessary before deploying to github):

```sh
$ gulp build --prod
```

Deploy the site to github on the gh-pages branch:

```sh
$ gulp deploy
```

Clean all of the compiled assets (scripts, styles, etc.)
```sh
$ gulp clean:assets
```

Clean the compiled site:
```sh
$ gulp clean:dist
```

Run the script to download data from google docs:
```sh
$ gulp data
```
## Owner

> [GC Digital Fellows](gcdigitalfellows.github.io)

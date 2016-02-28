# GC Digital Research Bootcamp Website

## tl;dr

Website for the GC Digital Fellows Digital Research Bootcamp. Clone, run `npm install`, `bower install`, `bundle install` and then `npm run serve` to set everything up and start the development server.

## Setup (OS X and Linux)

1. Open a terminal window and execute the following command then follow the instructions:
    ```sh
    bash -c \"$(curl -L https://raw.githubusercontent.com/GCDigitalFellows/gcdigitalfellows.github.io/master/setup.sh)\"
    ```
2. After the first script finishes, close the terminal window, open a new terminal, then run the following command:
    ```sh
      bash -c \"$(curl -L https://raw.githubusercontent.com/GCDigitalFellows/gcdigitalfellows.github.io/master/setup2.sh)\"
    ```
3. If both scripts complete successfully, you're all set up and ready to start development.
4. To run the development server: `npm run serve`

## Manual Setup

### Requirements

- Node.js + NPM (might need to use version 5.x): JS build server and package management
- Ruby + Rubygems + Bundler: for Jekyll
- Bower (via npm): web dependency package management

### Manual Installation (all OSes)

1. Install [Node.js](https://nodejs.org/en/https://nodejs.org/en/)
2. Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/) if it's not already installed on your computer.
3. Install [Bower](http://bower.io/#install-bower) globally (with the -g flag) from a terminal:
    ```sh
    npm install -g bower
    ```
4. Install [Bundler](http://bundler.io/) (might need to use sudo)
5. Clone this repo and `cd` into the new repo directory:
    ```sh
    git clone git@github.com:GCDigitalFellows/gcdigitalfellows.github.io.git
    cd gcdigitalfellows.github.io
    ```
6. Install node, bower, and ruby components:
    ```sh
    npm install
    bower install
    bundle install
    ```
## Details of the scripts

The following build scripts are included in package.json (you can view these by running `npm run`). Run these from the command line `npm run [script name]`:
- `clean`: cleans temporary files created by these scripts. Run this if something is being wonky and you suspect it might be due to leftover artifacts from earlier builds.
- `data`: retrieves data from Google Sheets and saves it to the `_data` folder in yaml format.
- `assets`: build all of the styles and scripts, and copies vendor stuff to the appropriate places. Also gets data from Google Docs.
- `assets:vendor`: just build vendor assets
- `lint:js`: syntax check javascript (only main.js)
- `lint:sass`: syntax check sass (only style.scss)
- `scripts`: build javavscript (only main.js)
- `styles`: build sass (only style.scss)
- `watch:scripts`: build javascript + recompile on changes (using `serve` is more useful).
- `watch:styles`: ditto above for sass
- `jekyll:build`: build jekyll site to the `_site` directory (or whatever is defined in `_config.yml`)
- `jekyll:serve`: build jekyll and run the server + rebuild on changes
- `livereload`: start live reload server (pointless to run alone)
- `serve`: build and start the server, rebuild + reload on changes

## Directory Structure

- Markdown, textile, and HTML files in the root directory get built into individual pages by Jekyll. `index.html` is the default landing page. Jekyll will look at files ending in `.md`, `.markdown`, `.html` and `.textile`.
- The `_includes` directory contains reusable HTML/Markdown snippets that can be included on any page using the tag `{% include some-snippet %}` to include the snippet in `_includes/some-snippet.html`.
- The `_layouts` directory contains page or post layouts that serve as the base for pages. For example, `default.html` is used as the base for the `index.html` page. See the [Jekyll documentation](https://jekyllrb.com/docs/structure/) for more details.
- The `_posts` directory contains dynamic blog-type posts. Currently unused.
- The `_data` directory contains all of the data used to populate content throughout the website. Most of this comes from the `get_data.js` script, but some is manually maintained (like the menus).
- The `js` directory contains javascript to be included in the website. Currently, it uses a single `main.js` file to hold all of the scripts, plus a `vendor.min.js` file that contains all of the third-party scripts. If you add additional javascript files, you need to remember to include them in the html (e.g., in `_includes/scripts.html`); these will not be minified or linted.
- The `css` directory contains the compiled style scripts. You shouldn't modify stuff in here (see `_sass` for more info).
- The `_scss` directory contains all of the scss/sass used to style the site. The `_style.scss` file is the only one compiled, so if you want to add additional scss, be sure to include it within the `_style.scss` file. Most of the custom styles are currently contained in `_base.scss`. Note also that `_style.scss` includes Bootstrap so that we can use a custom build of Bootstrap that overrides some of its default variables. When `_style.scss` is compiled, it's output to `css/style.min.css`.
- The `fonts` and `images` directories contain vendor fonts and whatever images are used on the site, respectively. When including images, be sure to use the Jekyll prepend: site.baseurl filter to ensure the files are linked correctly (see below for more info).
- The `build_vendor.js` script collects dependencies (js+css) listed within the script and concatenates them and minifies them, then copies them to the appropriate directories. Also copies fonts to the fonts directory.
- The `get_data.js` script pulls data from Google Sheets and outputs JSON formatted data to the `_data` directory. Run this by calling `npm run data` or `node get_data.js`. If, for whatever reason, you'd prefer YAML to JSON, uncomment the require statement near the top of the script, uncomment the line with fs.write(...yaml...), and comment the line below it with fs.write(...JSON.stringify...), then change the outFile names to .yml instead of .json.

## Development Info
- The site is configured through the `_config.yml` file. Read the Jekyll docs to understand how this works. Of particular importance is the `baseurl` entry, which, when uncommented, will add the appropriate base directory to all of the links used throughout the site, needed when the site is not hosted on the root directory (e.g., http://gcdigitalfellows.github.io/gcdrb/apply instead of http://gcdigitalfellows.github.io/apply)
- The site uses packages from Bower (e.g., Bootstrap). If you add additional packages using Bower (or npm for that matter), be sure to modify the `build_vendor.js` script to include the necessary scripts or stylesheets (and fonts if applicable). For example, if the package contains just one additional javascript file in its 'dist' folder, you would add the line 'some-new-package/dist/the-main-js-file.js' in the array of javascript includes, around line #7. Note that you don't need to include the 'bower_components' base directory since the script already assumes that as the base directory. To include something from the node_modules directory, you would either need to add the `.changeDir('../node_modules').concat('new-node/module/path.js')` or alternatively, you could just use the relative path in the existing bower_components list like `'../node_modules/new-node/module/path.js'`. See the [Buildify](https://github.com/powmedia/buildify) documentation for more info.
- To add additional data sources to the `get_data.js` script, you can copy-paste one of the existing script blocks that looks like this:
    ```javascript
    new GDocData({
      gdocUrlBase: docurl,
      gdocSheet: '585110058',
      outFile: 'workshops.yml',
      outDir: dataDir
    }).getData();
    ```
    and just change the `gdocSheet` to the sheet number of the new data source (found in the URL, the number after the `gid=`), and change the `outFile` to whatever you'd like the new file to be named. If you need to process the data before writing the file, add a the `processRows` function like the one used for `people.json`. Be sure to pass the `rows` variable (it's an array containing each row of the source spreadsheet), and return an array containing the modified data. Side note: yes, it's weird that I did this using a class, but it's because I originally used multiple methods with it, but got rid of them because I ran into problems using Node streams.

## Deploying

- To deploy, use git to push this repo to the `gcdigitalfellows.github.io` master branch. Github should take care of building Jekyll. Just make sure that you at least run `npm run assets` prior to pushing.
- Be forewarned, any changes you push to the Master branch of this repo will immediately be published on the main branch. I therefore urge you to work on a separate branch so you can push changes without affecting the live website.

# GC Digital Research Bootcamp Website

## tl;dr

Website for the GC Digital Fellows Digital Research Bootcamp. 

0. Edit [spreadsheet](https://docs.google.com/spreadsheets/d/1e5y9HYYq-dtuGrHxVmsEieY2jB3EErWoVYxytTMnAHw/edit#gid=863043106)
1. Update data via `node get_data`
2. Test changes via `bundle exec jekyll serve` 


## Setup (OS X and Linux)
### Requirements

- Node.js + NPM (use LTF version): JS build server and package management
- Ruby + Rubygems + Bundler: for Jekyll

### Manual Installation (all OSes)

### Requirements

- Node.js + NPM (might need to use version 5.x): JS build server and package management
- Ruby + Rubygems + Bundler: for Jekyll
- Bower (via npm): web dependency package management

### Manual Installation (all OSes)

1. Install [Node.js](https://nodejs.org/en/). It is recommended that you use [homebrew](https://brew.sh) to install node since it will help prevent permissions issues.

2. Install [Ruby](https://www.ruby-lang.org/en/documentation/installation/) if it's not already installed on your computer. You might want to install ruby using homebrew for the same reasons as above.

3. Clone this repo and `cd` into the new repo directory:

    ```shell
    git clone git@github.com:GCDigitalFellows/gcdigitalfellows.github.io.git
    cd gcdigitalfellows.github.io
    ```

4. Install node and ruby components:

    ```shell
    npm install jekyll
    ```
    
5. Run the update data script 
   ```shell
   node get_data
   ```
 Try to resolve `Error: Cannot find module 'X'` error with `npm install X`. Repeat until all packages are installed.

## Running the Development Server

  ```shell
  bundle exec jekyll serve
  ```

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
      outDir: dataDir,
      processRows: function (rows) {
        // callback function to manipulate the data rows before saving
        // ‘rows’ is an array, and each item is an array containing key:value pairs of column_name:value
        // if the Worksheet contains columns ‘name’ and ‘age’:
        // > rows[3].age = cell B5 (if the column names are in the first row, so this is the 4th data row)
        // > rows[0] = { name: ‘name0’, age: ‘age0’ }
        // this function should return essentially the same type of array as ‘rows’, with updated key:value pairs.
      }
    }).getData();
    ```

  Just change the `gdocSheet` to the sheet number of the new data source (found in the URL, the number after the `gid=`), and change the `outFile` to whatever you'd like the new file to be named. If you need to process the data before writing the file, add a the `processRows` function like the one used for `people.json`. Be sure to pass the `rows` variable (it's an array containing each row of the source spreadsheet), and return an array containing the modified data. Side note: yes, it's weird that I did this using a class, but it's because I originally used multiple methods with it, but got rid of them because I ran into problems using Node streams.

## Deploying

- To deploy, use git to push this repo to the `gcdigitalfellows.github.io` master branch. Github should take care of building Jekyll. Just make sure that you at least run `npm run assets` prior to pushing.

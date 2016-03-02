const buildify = require('buildify');
const fs = require('fs-extra');

// Build vendor javascript
buildify('bower_components')
  .concat([
    'jquery/dist/jquery.min.js',
    'animated-header/js/animated-header.js',
    'FitText.js/jquery.fittext.js',
    'jquery.easing/js/jquery.easing.min.js',
    'wow/dist/wow.min.js',
    'tether/dist/js/tether.js',
    'bootstrap/dist/js/bootstrap.js',
    'jquery.serializeJSON/jquery.serializejson.min.js',
    'bootstrap-validator/dist/validator.min.js'])
  .uglify()
  .save('../js/vendor.min.js');

// Build vendor styles
buildify('bower_components')
  .concat([
    'animate.css/animate.min.css',
    'font-awesome/css/font-awesome.min.css',
    'font-mfizz/css/font-mfizz.css'
  ])
  .cssmin()
  .save('../css/vendor.min.css');

// Copy vendor fonts
var fontList = [
  'bower_components/font-awesome/fonts/',
  'bower_components/font-mfizz/fonts/'
];
for (var c = 0; c < fontList.length; c++) {
  try {
    fs.copySync(fontList[c], 'fonts');
    console.log('Copied ' + fontList[c] + ' to ./fonts');
  } catch (err) {
    console.error(err);
  }
}

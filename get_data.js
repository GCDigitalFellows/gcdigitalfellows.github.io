const request = require('request');
const babyparse = require('babyparse');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const escape = require('escape-html');


// sheet to update
// uggcf://qbpf.tbbtyr.pbz/fcernqfurrgf/q/1r5l9ULLd-qghTeUkIzfRvrL2wO3RReJbILklgGZaNUj/rqvg#tvq=863043106

var oldurl = 'https://docs.google.com/spreadsheets/d/16RfbdrnDHhRgP2iZwNw6AVSyWy5VoKn0nB0CpyMa658/pub?';
var jun16dri = 'https://docs.google.com/spreadsheets/d/1e5y9HYYq-dtuGrHxVmsEieY2jB3EErWoVYxytTMnAHw/pub?';
var dataDir = '_data/';
var outExt = 'json';
// var outExt = 'yml';

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '863043106',
  outFile: 'overview.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '55408582',
  outFile: 'outcomes.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '585110058',
  outFile: 'workshops.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '1411565774',
  outFile: 'people.' + outExt,
  outDir: dataDir,
  processRows: function (rows) {
    var outData = {};
    for (var c = 0; c < rows.length; c++) {
      if (rows[c].bio) {
        rows[c].bio = '<p>' + escape(rows[c].bio) + '</p>';
        rows[c].bio = rows[c].bio.replace(/(\n)/g, '</p><p>');
      }
      if (rows[c].id) {
        rows[c].id = rows[c].name.replace(/\s/g, '-').toLowerCase();
      }
      if (rows[c].shortname) {
        outData[rows[c].shortname] = rows[c];
      }
    }
    return outData;
  }
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '2001419383',
  outFile: 'partners.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '1809179717',
  outFile: 'rooms.' + outExt,
  outDir: dataDir,
  processRows: function (rows) {
    var outData = {};
    for (var c = 0; c < rows.length; c++) {
      var row = rows[c];
      if (row.short) {
        outData[row.short] = {
          name: row.name,
          capacity: row.capacity,
          location: row.location
        };
      }
    }
    return outData;
  }
});

getData({
  gdocUrlBase: jun16dri,
  gdocSheet: '470059533',
  outFile: 'schedule.' + outExt,
  outDir: dataDir,
  processRows: function (rows) {
    var outData = [];
    var timeslot;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      timeslot = row.Time || timeslot;
      if (timeslot && timeslot.indexOf('Day') > -1) {
        outData.push({day: row.Time, date: row.Session, timeslots: []});
      // } else if (row.Session) {
      } else {
        outData[outData.length - 1].timeslots.push({
          time: timeslot || '',
          session: row.Session || '',
          title: row.Title || '',
          room: row.Room || '',
          instructor: row.Instructors || '',
          // instructorlink: linkFromNames(row.Instructors, '/instructors'),
          link: row.link || '',
          class: row.class || ''
        });
      } 
      // else {
      //   outData[outData.length - 1].timeslots.push({
      //     time: row.Time,
      //     title: row.Title,
      //     room: row.Room
      //   });
      // }
    }
    return outData;
  }
});

getData({
  gdocUrlBase: oldurl,
  gdocSheet: '585110058',
  outFile: 'oldworkshops.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: oldurl,
  gdocSheet: '470059533',
  outFile: 'oldschedule.' + outExt,
  outDir: dataDir,
  processRows: function (rows) {
    var outData = [];
    var timeslot;
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      timeslot = row.Time || timeslot;
      if (timeslot && timeslot.indexOf('Day') > -1) {
        outData.push({day: row.Time, date: row.Session, timeslots: []});
      } else if (row.Session) {
        outData[outData.length - 1].timeslots.push({
          time: timeslot,
          session: row.Session,
          title: row.Title,
          room: row.Room,
          instructor: row.Instructors,
          instructorlink: linkFromNames(row.Instructors, '/instructors'),
          link: row.link
        });
      } else {
        outData[outData.length - 1].timeslots.push({
          time: row.Time,
          title: row.Title,
          room: row.Room
        });
      }
    }
    return outData;
  }
});

function linkFromNames(names, urlPrefix) {
  var nameList = names.split(',');
  var links = '';
  for (var c = 0; c < nameList.length; c++) {
    var name = nameList[c].trim();
    if (links !== '') {
      links += ', ';
    }
    links += '<a href="' + urlPrefix + '/#';
    name = name.replace(/\s/g, '-').toLowerCase();
    links += name + '\">' + nameList[c].trim() + '</a>';
  }
  return links;
}

function getData(options) {
  // Gets data from a google spreadsheet and saves it locally as json/yml file
  // The sheet needs to be published to the web as a csv:
  // => File > publish to the web > link > csv
  //
  // options as follows:
  // gdocUrlBase (string): the base url of the google spreadsheet everything 
  //  before the worksheet id #
  // gdocSheet (string): the worksheet id # from the url. separated into a 
  //  separate variable so you can run this using the same base url for 
  //  multiple sheets in the same document. Default is '0' (first sheet)
  // outFile (string): filename for the output file, including appropriate 
  //  extension of either .json or .yml. If neither extension is given, it 
  //  defaults to outputting a json file regardless of file extension.
  //  Default value is 'gdocdata.json'
  // outDir (string): pathname for the output file, relative to this script.
  //  Default value is the current directory.
  // parseOptions (dictionary): options to pass to the csv parser. 
  //  see https://github.com/Rich-Harris/BabyParse and http://papaparse.com/
  //  Default is to use a header row, skip empty lines, and treat lines
  //  that start with '//' as comments (ignored)
  // processRows: callback function to process the csv data prior to writing.
  //  takes one parameter, the parse output from babyparse (see link above)
  //  should return a similarly formatted array.

  options = options || {};
  var gdocUrlBase = options.gdocUrlBase;
  var gdocSheet = options.gdocSheet || '0';
  var outFile = options.outFile || 'gdocdata.json';
  var outDir = options.outDir || './';
  var parseOptions = options.parseOptions || {
    header: true,
    skipEmptyLines: true,
    comments: '//'
  };
  var processRows = options.processRows;

  var gdocUrl = gdocUrlBase + 'gid=' + gdocSheet + '&single=true&output=csv';
  var format = (outFile.indexOf('yml') > -1 ? 'yaml' : 'json');

  request(gdocUrl, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('Successfully read ' + outFile + ' from Google Docs.');
      var rows = babyparse.parse(body, parseOptions).data;
      if (typeof processRows === 'function') {
        console.log('Processing data for ' + outFile);
        rows = processRows(rows);
      }
      if (format === 'yaml') {
        fs.writeFile(outDir + outFile, yaml.safeDump(rows));
      } else {
        fs.writeFile(outDir + outFile, JSON.stringify(rows));
      }
      console.log('Wrote data to ' + outFile);
    } else {
      console.error('Failed to get ' + outFile + ' data from Google Docs. \n Error: ' + error + '\nResponse: ' + response);
    }
  });
}


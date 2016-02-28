const request = require('request');
const babyparse = require('babyparse');
// const yaml = require('js-yaml');
const fs = require('fs-extra');
const escape = require('escape-html');

var docurl = 'https://docs.google.com/spreadsheets/d/16RfbdrnDHhRgP2iZwNw6AVSyWy5VoKn0nB0CpyMa658/pub?';
var dataDir = '_data/';

var GDocData = function (options) {
  options = options || {};
  this.gdocUrlBase = options.gdocUrlBase;
  this.gdocSheet = options.gdocSheet;
  this.outFile = options.outFile;
  this.outDir = options.outDir;
  this.parseOptions = options.parseOptions || {
    header: true,
    skipEmptyLines: true,
    comments: '//'
  };
  this.processRows = options.processRows;
  return this;
};

GDocData.prototype.getData = function () {
  var gdocUrl = this.gdocUrlBase + 'gid=' + this.gdocSheet + '&single=true&output=csv';
  var me = this;
  request(gdocUrl, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('Successfully read ' + me.outFile + ' from Google Docs.');
      var rows = babyparse.parse(body, me.parseOptions).data;
      if (typeof me.processRows === 'function') {
        console.log('Processing data for ' + me.outFile);
        rows = me.processRows(rows);
      }
      // fs.writeFile(me.outDir + me.outFile, yaml.safeDump(rows));
      fs.writeFile(me.outDir + me.outFile, JSON.stringify(rows));
      console.log('Wrote data to ' + me.outFile);
    } else {
      console.error('Failed to get ' + me.outFile + ' data from Google Docs. \n Error: ' + error + '\nResponse: ' + response);
    }
  });
};

new GDocData({
  gdocUrlBase: docurl,
  gdocSheet: '585110058',
  outFile: 'workshops.json',
  outDir: dataDir
}).getData();

new GDocData({
  gdocUrlBase: docurl,
  gdocSheet: '1411565774',
  outFile: 'people.json',
  outDir: dataDir,
  processRows: function (rows) {
    for (var c = 0; c < rows.length; c++) {
      if (rows[c].bio) {
        rows[c].bio = '<p>' + escape(rows[c].bio) + '</p>';
        rows[c].bio = rows[c].bio.replace(/(\n)/g, '</p><p>');
      }
      if (rows[c].id) {
        rows[c].id = rows[c].name.replace(/\s/g, '-').toLowerCase();
      }
    }
    return rows;
  }
}).getData();

new GDocData({
  gdocUrlBase: docurl,
  gdocSheet: '2001419383',
  outFile: 'partners.json',
  outDir: dataDir
}).getData();

new GDocData({
  gdocUrlBase: docurl,
  gdocSheet: '1809179717',
  outFile: 'rooms.json',
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
}).getData();

new GDocData({
  gdocUrlBase: docurl,
  gdocSheet: '470059533',
  outFile: 'schedule.json',
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
}).getData();

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

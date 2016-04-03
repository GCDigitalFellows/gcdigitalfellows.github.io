const request = require('request');
const babyparse = require('babyparse');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const escape = require('escape-html');

var docurl = 'https://docs.google.com/spreadsheets/d/1e5y9HYYq-dtuGrHxVmsEieY2jB3EErWoVYxytTMnAHw/pub?';
var dataDir = '_data/';
var outExt = 'json';
// var outExt = 'yml';

getData({
  gdocUrlBase: docurl,
  gdocSheet: '863043106',
  outFile: 'prelim.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: docurl,
  gdocSheet: '55408582',
  outFile: 'outcomes.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: docurl,
  gdocSheet: '585110058',
  outFile: 'workshops.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: docurl,
  gdocSheet: '1411565774',
  outFile: 'people.' + outExt,
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
});

getData({
  gdocUrlBase: docurl,
  gdocSheet: '2001419383',
  outFile: 'partners.' + outExt,
  outDir: dataDir
});

getData({
  gdocUrlBase: docurl,
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

// getData({
//   gdocUrlBase: docurl,
//   gdocSheet: '470059533',
//   outFile: 'schedule.' + outExt,
//   outDir: dataDir,
//   processRows: function (rows) {
//     var outData = [];
//     var timeslot;
//     for (var i = 0; i < rows.length; i++) {
//       var row = rows[i];
//       timeslot = row.Time || timeslot;
//       if (timeslot && timeslot.indexOf('Day') > -1) {
//         outData.push({day: row.Time, date: row.Session, timeslots: []});
//       } else if (row.Session) {
//         outData[outData.length - 1].timeslots.push({
//           time: timeslot,
//           session: row.Session,
//           title: row.Title,
//           room: row.Room,
//           instructor: row.Instructors,
//           instructorlink: linkFromNames(row.Instructors, '/instructors'),
//           link: row.link
//         });
//       } else {
//         outData[outData.length - 1].timeslots.push({
//           time: row.Time,
//           title: row.Title,
//           room: row.Room
//         });
//       }
//     }
//     return outData;
//   }
// });
//
// function linkFromNames(names, urlPrefix) {
//   var nameList = names.split(',');
//   var links = '';
//   for (var c = 0; c < nameList.length; c++) {
//     var name = nameList[c].trim();
//     if (links !== '') {
//       links += ', ';
//     }
//     links += '<a href="' + urlPrefix + '/#';
//     name = name.replace(/\s/g, '-').toLowerCase();
//     links += name + '\">' + nameList[c].trim() + '</a>';
//   }
//   return links;
// }

function getData(options) {
  options = options || {};
  var gdocUrlBase = options.gdocUrlBase;
  var gdocSheet = options.gdocSheet || '0';
  var outFile = options.outFile || 'gdocdata.json';
  var outDir = options.outDir || '_data';
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


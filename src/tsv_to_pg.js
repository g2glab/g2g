var fs = require('fs');
var path = require('path');
var common = require('./common.js');

function replaceAngleBracketsWithQuotes(src) {
  return src.trim().replace(/^</, "\"").replace(/>$/, "\"");
}

function removeLanguageTag(src) {
  return src.replace(/@\w*$/, "");
}

/// Add quotes if neseccary and remove quotes if not necessary
function addOrRemoveQuotes(src) {
  if (src.match(/^\".*\"$/)) {  // if src is double-quoated, it is a srcing
    if (! src.match(/:|\s/)) {  // if src does not include colon (:) or spaces or tabs
      return src.substring(1, src.length - 1);
    }
  }
  else {
    if (src.match(/:|\s/)) {
      return '"' + src + '"';
    }
  }
  return src;
}

function preprocessText(txt) {
  txt = replaceAngleBracketsWithQuotes(txt);
  txt = removeLanguageTag(txt);
  return addOrRemoveQuotes(txt).replace(/^\".*"".*$\"/g, '\\"');
}

function translateNode(src, dst) {
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) => {
    data = row.split('\t');
    if (data.length < 2) return;
    var line = preprocessText(data[0]) + '\t:' + preprocessText(data[1]); // id + label
    for (var i = 2; i < data.length; i += 2) {
      var key = preprocessText(data[i]);
      var props = data[i+1].replace(/^\"/, "").replace(/\"$/, "");
      if (props != '') {
        props.split(common.g2g_separator).forEach((prop) => {
          line += '\t' + key + ':' + preprocessText(prop);
        });
      } // properties
    }
    return line;
  });
  if (fs.existsSync(dst)) {
    fs.appendFileSync(dst, lines.join('\n'), 'utf8');
  } else {
    fs.writeFileSync(dst, lines.join('\n'), 'utf8');
  }
}

function translateEdge(src, dst) {
  var rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  var lines = rows.map((row) => {
    data = row.split('\t');
    if (data.length < 4) return;
    var edgeSymbol = data[3] == '"true"' ? '--' : '->';
    line = preprocessText(data[0]) + '\t' + edgeSymbol + '\t' + preprocessText(data[1]) + '\t:' + preprocessText(data[2]);
    for (var i = 4; i < data.length; i += 2) {
      var key = preprocessText(data[i]);
      var props = data[i+1].replace(/^\"/, "").replace(/\"$/, "");
      if (props != '') {
        props.split(common.g2g_separator).forEach((prop) => {
          line += '\t' + key + ':' + preprocessText(prop);
        });
      } // properties
    }
    return line;
  });
  if (fs.existsSync(dst)) {
    fs.appendFileSync(dst, lines.join('\n'), 'utf8');
  } else {
    fs.writeFileSync(dst, lines.join('\n'), 'utf8');
  }
}

exports.translateNode = translateNode;
exports.translateEdge = translateEdge;

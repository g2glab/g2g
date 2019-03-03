var fs = require('fs');
var path = require('path');

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

function translateNode(src, dst) {
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) => {
    data = row.replace(/""/g, '\\"').split('\t');
    for (var i = 0; i < data.length; i++) {
      data[i] = replaceAngleBracketsWithQuotes(data[i]);
      data[i] = removeLanguageTag(data[i]);
      data[i] = addOrRemoveQuotes(data[i]);
    }
    if (data.length < 2) return;
    var line = data[0] + '\t:' + data[1]; // id + label
    for (var i = 2; i < data.length; i += 2) {
      if (data[i+1] != '') line += '\t' + data[i] + ':' + data[i+1]; // properties
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
    data = row.replace(/""/g, '\\"').split('\t');
    for (var i = 0; i < data.length; i++) {
      data[i] = replaceAngleBracketsWithQuotes(data[i]);
      data[i] = removeLanguageTag(data[i]);
      data[i] = addOrRemoveQuotes(data[i]);
    }
    if (data.length < 4) return;
    var edgeSymbol = data[3] == 'true' ? '--' : '->';
    line = data[0] + ' ' + edgeSymbol + ' ' + data[1] + '\t:' + data[2];
    for (var i = 4; i < data.length; i += 2) {
      if (data[i+1] != '') line += '\t' + data[i] + ':' + data[i+1];
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

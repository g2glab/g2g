var fs = require('fs');
var path = require('path');

function replaceAngleBracketsWithQuotes(src) {
  return src.trim().replace(/^</, "\"").replace(/>$/, "\"");
}

function removeQuotes(src) {
  return src.substring(1, src.length - 1);
}

function isStringQuotesRemovable(str) {
  if (str.match(/\".*\"/)) {        // if str is double-quoated, it is a string
    if (! str.match(/:|\s/)) {      // if str does not include colon (:) or spaces or tabs
      return true;
    }
  }
  return false;
}

function translateNode(src, dst) {
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) => {
    data = row.replace(/""/g, '\\"').split('\t');
    for (var i = 0; i < data.length; i++) {
      data[i] = replaceAngleBracketsWithQuotes(data[i]);
      if (isStringQuotesRemovable(data[i])) {
        data[i] = removeQuotes(data[i]);
      }
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
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) => {
    data = row.replace(/""/g, '\\"').split('\t');
    for (var i = 0; i < data.length; i++) {
      data[i] = replaceAngleBracketsWithQuotes(data[i]);
      if (isStringQuotesRemovable(data[i])) {
        data[i] = removeQuotes(data[i]);
      }
    }
    if (data.length < 3) return;
    var line = data[0] + '\t' + data[1] + '\t:' + data[2];
    for (var i = 3; i < data.length; i += 2) {
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

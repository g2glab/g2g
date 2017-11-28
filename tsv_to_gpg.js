var fs = require('fs');
var path = require('path');

function removeQuotes(src){
  return src.substring(1, src.length - 1);
}

function translateNode(src, dst)
{
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) =>
               {
                 data = row.split('\t');
                 if(data.length < 2) return;
                 var line = data[0] + '\t type:' + data[1];
                 for(var i = 2; i < data.length; i += 2) {
                   line += '\t' + data[i] +':' + data[i+1];
                 }
                 return line;
               });
  if(fs.existsSync(dst)) {
    fs.appendFileSync(dst, lines.join('\n'), 'utf8');
  } else {
    fs.writeFileSync(dst, lines.join('\n'), 'utf8');
  }
}


function translateEdge(src, dst)
{
 rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  lines = rows.map((row) =>
               {
                 data = row.split('\t');
                 if(data.length < 3) return;
                 var line = data[0] + '\t' + data[1] + '\t type:' + data[2];
                 for(var i = 3; i < data.length; i += 2) {
                   line += '\t' + data[i] +':' + data[i+1];
                 }
                 return line;
               });
  if(fs.existsSync(dst)) {
    fs.appendFileSync(dst, lines.join('\n'), 'utf8');
  } else {
    fs.writeFileSync(dst, lines.join('\n'), 'utf8');
  }
}

exports.translateNode = translateNode;
exports.translateEdge = translateEdge;

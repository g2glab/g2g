// USAGE: $ node gpg_to_neo.js
var fs = require('fs');

function writeNodeCSV(src)
{
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  tableMap = {};
  properties = new Set();
  rows.forEach((row) =>
               {
                 data = row.split('\t');
                 if(data.length < 2) return;
                 if(!tableMap[data[0]])
                 {
                   tableMap[data[0]] = {};
                 }
                 tableMap[data[0]][data[1]] = data[2]
                 properties.add(data[1]);
               });

  properties = Array.from(properties);
  result = "nid:ID,name," + properties.join() + "\n";
  result += Object.keys(tableMap).map((key) =>
                                      {
                                        return key + ',' + key + ',' + properties.map((prop) => {return tableMap[key][prop];}).join(',');
                                      }).join('\n');

  fs.writeFileSync(src + '.csv', result, 'utf8');
}


function writeEdgeCSV(src)
{
  rows = fs.readFileSync(src, 'utf8').split('\n');
  rows.shift();
  tableMap = {};
  result = ":START_ID,:END_ID,:TYPE\n";
  rows.forEach((row) =>
               {
                 data = row.split('\t');
                 if(data.length < 3) return;
                 result += data[0] + ',' + data[1] + ',' + data[2] + "\n";
               });
  fs.writeFileSync(src + '.csv', result, 'utf8');
}

var outputDir = 'output';
var files = fs.readdirSync(outputDir);
files.filter((name) => name.endsWith('nodes.tsv')).forEach((name) => writeNodeCSV(outputDir + '/' + name));
files.filter((name) => name.endsWith('edges.tsv')).forEach((name) => writeEdgeCSV(outputDir + '/' + name));

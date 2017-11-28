// USAGE: $ node g2g_to_gpg.js <g2g_file> <endpoint> <dst_gpg>
// EXAMPLE: $ node g2g_to_gpg.js examples/musicans.g2g http://dbpedia.org/sparql musician.gpg


var fs = require('fs');
var path = require('path');

var g2gPath = process.argv[2];
var endpoint = process.argv[3];
var dstPath = process.argv[4];

var g2gmlToSparql = require('./g2gml_to_sparql.js');

var inputName = path.basename(g2gPath);

var tsvToGPG = require('./tsv_to_gpg.js');
var dstDir = './output/' + inputName;

var sparqlDir = dstDir + '/sparql/';
var tsvDir = dstDir + '/tsv/';
var gpgDir = dstDir + '/gpg/';
var g2gmlToSparql = require('./g2gml_to_sparql.js');
var client = require('./client.js');

tryToMkdir(dstDir);
tryToMkdir(sparqlDir);
tryToMkdir(tsvDir);
tryToMkdir(gpgDir);

[nodeFiles, edgeFiles] = g2gmlToSparql.g2gmlToSparql(g2gPath, sparqlDir);

if(fs.existsSync(dstPath))fs.unlinkSync(dstPath);

nodeFiles.forEach(
  (nodeFile) => {
    var tsvPath = tsvDir + path.basename(nodeFile) + '.tsv'
    client.query_sparql(endpoint, nodeFile, tsvPath, () => 
      tsvToGPG.translateNode(tsvPath, dstPath));
  }
);


edgeFiles.forEach(
  (edgeFile) => {
    var tsvPath = tsvDir + path.basename(edgeFile) + '.tsv';
    client.query_sparql(endpoint, edgeFile, tsvPath, () =>     tsvToGPG.translateEdge(tsvPath, dstPath));
  }
);


function tryToMkdir(dst) {
  if(!fs.existsSync(dst))fs.mkdirSync(dst);
}

// USAGE: $ node g2g_to_gpg.js <g2g_file> <endpoint> <dst_gpg>
// EXAMPLE: $ node g2g_to_gpg.js examples/musicians.g2g http://dbpedia.org/sparql musician.gpg

var g2gPath = process.argv[2];
var endpoint = process.argv[3];
var dstPath = process.argv[4];

var fs = require('fs');
var path = require('path');
var sparqlClient = require('./sparql_client.js');
var g2gmlToSparql = require('./g2g_to_sparql.js');
var tsvToGPG = require('./tsv_to_gpg.js');

var inputName = path.basename(g2gPath);

const OUTPUT_DIR = './output/'
const DST_DIR = OUTPUT_DIR + inputName;
const SPARQL_DIR = DST_DIR + '/sparql/';
const TSV_DIR = DST_DIR + '/tsv/';

tryToMkdir(OUTPUT_DIR);
tryToMkdir(DST_DIR);
tryToMkdir(SPARQL_DIR);
tryToMkdir(TSV_DIR);

[nodeFiles, edgeFiles] = g2gmlToSparql.g2gmlToSparql(g2gPath, SPARQL_DIR);

if(fs.existsSync(dstPath))fs.unlinkSync(dstPath);

nodeFiles.concat(edgeFiles).forEach(
  (file) => {
    var tsvPath = TSV_DIR + path.basename(file) + '.tsv'
    sparqlClient.query(endpoint, file, tsvPath, () => 
                       {
                         console.log('"' + tsvPath + '" has been created.');
                         tsvToGPG.translateNode(tsvPath, dstPath)
                       }
                      );
  }
);

function tryToMkdir(dst) {
  if(!fs.existsSync(dst))fs.mkdirSync(dst);
}

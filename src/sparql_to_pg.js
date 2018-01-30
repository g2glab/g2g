// USAGE: $ node sparql_to_pg.js <endpoint> <sparql_dir> <dst_pg>
// EXAMPLE: $ node sparql_to_pg.js http://dbpedia.org/sparql output/musicians.g2g/sparql musician.pg

var endpoint    = process.argv[2];
var SPARQL_DIR  = process.argv[3];
var dstPath     = process.argv[4];

var fs = require('fs');
var path = require('path');
var sparqlClient = require('./sparql_client.js');
var tsvToPg = require('./tsv_to_pg.js');

const OUTPUT_DIR = './output/'
const DST_DIR = OUTPUT_DIR + path.basename(dstPath);
const TSV_DIR = DST_DIR + '/tsv/';

tryToMkdir(OUTPUT_DIR);
tryToMkdir(DST_DIR);
tryToMkdir(TSV_DIR);

var sparql_files = fs.readdirSync(SPARQL_DIR);

nodeFiles = sparql_files.filter((name) => name.startsWith('nodes')).map((name) => SPARQL_DIR + name);
edgeFiles = sparql_files.filter((name) => name.startsWith('edges')).map((name) => SPARQL_DIR + name);

if(fs.existsSync(dstPath))fs.unlinkSync(dstPath);

nodeFiles.forEach(file => queryTsv(file, tsvToPg.translateNode));
edgeFiles.forEach(file => queryTsv(file, tsvToPg.translateEdge));

function queryTsv(file, callback) {
  var tsvPath = TSV_DIR + path.basename(file) + '.tsv'
  sparqlClient.query(endpoint, file, tsvPath, () => {
      console.log('"' + tsvPath + '" has been created.');
      callback(tsvPath, dstPath)
    });
}

function tryToMkdir(dst) {
  if(!fs.existsSync(dst))fs.mkdirSync(dst);
}

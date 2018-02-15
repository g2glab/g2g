// USAGE: $ node sparql_to_pg.js <endpoint> <sparql_dir> <tsv_dir> <pg_path>
// EXAMPLE: $ node sparql_to_pg.js http://dbpedia.org/sparql output/musician/

var endpoint    = process.argv[2];
var sparqlDir  = process.argv[3];
var tsvDir     = process.argv[4];
var dstPath     = process.argv[5];

var fs = require('fs');
var path = require('path');
var sparqlClient = require('./sparql_client.js');
var tsvToPg = require('./tsv_to_pg.js');

tryToMkdir(tsvDir);

var sparql_files = fs.readdirSync(sparqlDir);

nodeFiles = sparql_files.filter((name) => name.startsWith('nodes')).map((name) => sparqlDir + name);
edgeFiles = sparql_files.filter((name) => name.startsWith('edges')).map((name) => sparqlDir + name);

if(fs.existsSync(dstPath))fs.unlinkSync(dstPath);

nodeFiles.forEach(file => queryTsv(file, tsvToPg.translateNode));
edgeFiles.forEach(file => queryTsv(file, tsvToPg.translateEdge));

function queryTsv(file, callback) {
  var tsvPath = tsvDir + path.basename(file) + '.tsv'
  sparqlClient.query(endpoint, file, tsvPath, () => {
      console.log('"' + tsvPath + '" has been created.');
      callback(tsvPath, dstPath)
    });
}

function tryToMkdir(dst) {
  if(!fs.existsSync(dst))fs.mkdirSync(dst);
}

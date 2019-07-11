#!/usr/bin/env node

// USAGE: $ sparql_to_pg <endpoint|local_file> <sparql_dir> <tsv_dir> <pg_path> <count_on_each_page>
// EXAMPLE: $ sparql_to_pg http://dbpedia.org/sparql output/musician/ output/musician/tsv output_musician/mucisian.pg 10000

var dataSrc    = process.argv[2];
var sparqlDir  = process.argv[3];
var tsvDir     = process.argv[4];
var dstPath    = process.argv[5];
var pageSize = parseInt(process.argv[6]);

var fs = require('fs');
var path = require('path');
var validUrl = require('valid-url');
var childProcess = require('child_process');
var sparqlClient = require('./sparql_client.js');
var tsvToPg = require('./tsv_to_pg.js');

tryToMkdir(tsvDir);

var sparql_files = fs.readdirSync(sparqlDir);

nodeFiles = sparql_files.filter((name) => name.startsWith('nodes')).map((name) => sparqlDir + name);
edgeFiles = sparql_files.filter((name) => name.startsWith('edges')).map((name) => sparqlDir + name);

if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);

nodeFiles.forEach(file => queryTsv(file, tsvToPg.translateNode, pageSize));
edgeFiles.forEach(file => queryTsv(file, tsvToPg.translateEdge, pageSize));


// query all rows with pagination
function queryAll(dataSrc, query, tsvPath, currentOffset, pageSize, callback) {
  var currentTsvPath = currentOffset <= 1 ? tsvPath : path.dirname(tsvPath) + path.basename(tsvPath, '.tsv') + currentOffset.toString() + '.tsv';
  var currentQuery = query + ` LIMIT ${pageSize}`;
  if(currentOffset > 1) {
    currentQuery += ` OFFSET ${currentOffset}`;
  }
  sparqlClient.query(dataSrc, currentQuery, currentTsvPath, (partial) => {
    console.log('"' + currentTsvPath + '" has been created.');
    callback(tsvPath, dstPath);
    if(partial) {
      console.log(`Query next page (from ${currentOffset + pageSize})...`);
      queryAll(dataSrc, query, tsvPath, currentOffset + pageSize, pageSize, callback);
    }
  });
}

function queryTsv(file, callback, pageSize) {
  var tsvPath = tsvDir + path.basename(file, '.rq') + '.tsv';
  if (validUrl.isUri(dataSrc)) { // use remote endpoint
    if(pageSize <= 0)
    {
      sparqlClient.query(dataSrc, file, tsvPath, (partial) => {
        console.log('"' + tsvPath + '" has been created.');
        callback(tsvPath, dstPath);
      });
    } else {
      query = fs.readFileSync(file, 'utf-8');
      queryAll(dataSrc, query, tsvPath, 1, pageSize, callback);
    }
  } else { // use ARQ
    if (!fs.existsSync(dataSrc)) {
      console.log('ERROR: "' + dataSrc + '" does not exist.' );
      process.exit(-1);
    }
    var arq_result = childProcess.execSync('arq --data ' + dataSrc + ' --query ' + file + ' --results=tsv').toString();
    arq_result = arq_result.replace(/</g, '"');
    arq_result = arq_result.replace(/>/g, '"');
    arq_result = arq_result.replace(/"\^\^[^\t\n]+/g, '"');  //remove xsd
    arq_result = arq_result.replace(/"\@[^\t\n]+/g, '"');  //remove language tag
    fs.writeFile(tsvPath, arq_result, 'utf8', function (err)      {
        if (err != null) {
          console.log(err);
        }
        callback(tsvPath, dstPath);
      });
  }
}

function tryToMkdir(dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst);
}

// USAGE: $ node g2g.js <rq|pg|neo|pgx> <g2g_path> <endpoint> <output_dir(optional)>

var fs = require('fs');
var common = require('./src/common.js');
var path = require('path');

[dstFormat, g2gPath, endpoint, dstDir] = process.argv.slice(2);



var inputName = common.removeExtension(path.basename(g2gPath));

if(dstDir == undefined) dstDir = './output/' + inputName;

const SPARQL_DIR = dstDir + '/sparql/';
var pgPath = dstDir + '/' + inputName + '.pg';


common.mkdirPath(dstDir);
common.mkdirPath(SPARQL_DIR);

function afterSparql(err) {
  if(err) throw err;
  if(dstFormat != 'rq') {
    common.runScript('./src/sparql_to_pg.js', afterPg, endpoint, SPARQL_DIR, dstDir + "/tsv/", pgPath);
  }
}


function afterPg(err) {
  if(err) throw err;
  console.log('"' + pgPath + '" has been created.');
  switch(dstFormat) {
    case 'neo':
    var neoDir = dstDir + "/neo/";
    common.mkdirPath(neoDir);
    common.runScript('./pg_to_neo.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, neoDir + inputName);
    break;
    case 'pgx':
    var pgxDir = dstDir + "/pgx/";
    common.mkdirPath(pgxDir);
    common.runScript('./pg_to_pgx.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, pgxDir + inputName);
    break;
    case 'pg':
    console.log('Done.');
    break;
  }
}

common.runScript('./src/g2g_to_sparql.js', afterSparql, g2gPath, SPARQL_DIR);

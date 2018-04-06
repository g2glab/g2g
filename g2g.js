// USAGE: $ node g2g.js <rq|pg|neo|pgx> <g2g_path> <endpoint>

[dstFormat, g2gPath, endpoint] = process.argv.slice(2);

var path = require('path');

var inputName = removeExtension(path.basename(g2gPath));

const OUTPUT_DIR = './output/'
const DST_DIR = OUTPUT_DIR + inputName;
const SPARQL_DIR = DST_DIR + '/sparql/';
var pgPath = DST_DIR + '/' + inputName + '.pg';

var fs = require('fs');
var common = require('./src/common.js');

tryToMkdir(OUTPUT_DIR);
tryToMkdir(DST_DIR);
tryToMkdir(SPARQL_DIR);

function removeExtension(name) {
  return name.substring(0, name.lastIndexOf('.')) || name;
}

function afterSparql(err) {
  if(err) throw err;
  if(dstFormat != 'rq') {
    common.runScript('./src/sparql_to_pg.js', afterPg, endpoint, SPARQL_DIR, DST_DIR + "/tsv/", pgPath);
  }
}


function afterPg(err) {
  if(err) throw err;
  console.log('"' + pgPath + '" has been created.');
  switch(dstFormat) {
    case 'neo':
    var neoDir = DST_DIR + "/neo/";
    tryToMkdir(neoDir);
    common.runScript('./pg_to_neo.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, neoDir + inputName);
    break;
    case 'pgx':
    var pgxDir = DST_DIR + "/pgx/";
    tryToMkdir(pgxDir);
    common.runScript('./pg_to_pgx.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, pgxDir + inputName);
    break;
    case 'pg':
    console.log('Done.');
    break;
  }
}

function tryToMkdir(dst) {
  if(!fs.existsSync(dst))fs.mkdirSync(dst);
}

common.runScript('./src/g2g_to_sparql.js', afterSparql, g2gPath, SPARQL_DIR);

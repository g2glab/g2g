// USAGE: $ node g2gml_mapper.js <rq|pg|neo|pgx> <g2g_path> <dst_prefix> <endpoint>

[dstFormat, g2gPath, dstPrefix, endpoint] = process.argv.slice(2);

var path = require('path');

var pgPath = dstPrefix + '.pg';
var inputName = path.basename(g2gPath);

const OUTPUT_DIR = './output/'
const DST_DIR = OUTPUT_DIR + inputName;
const SPARQL_DIR = DST_DIR + '/sparql/';

var childProcess = require('child_process');

function runScript(scriptPath, callback, ...args) {
  // keep track of whether callback has been invoked to prevent multiple invocations
  var process = childProcess.fork(scriptPath, args);
  var invoked = false;
  // listen for errors as they may prevent the exit event from firing
  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
}

function afterSparql(err) {
  if(err) throw err;
  if(dstFormat != 'rq') {
    runScript('./src/sparql_to_pg.js', afterPg, endpoint, SPARQL_DIR, pgPath);
  }
}


function afterPg(err) {
  if(err) throw err;
  switch(dstFormat) {
    case 'neo':
    runScript('./src/pg_to_neo.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, dstPrefix);
    break;
    case 'pgx':
    runScript('./src/pg_to_pgx.js', (err) => {if(err) throw err; console.log('Done.');}, pgPath, dstPrefix);
    break;
    case 'pg':
    console.log('Done.');
    break;
  }
}

runScript('./src/g2g_to_sparql.js', afterSparql, g2gPath);

// USAGE: $ node g2gml_mapper.js <pg|neo|pgx> <endpoint> <g2g_file> <dst_prefix>

[dstFormat, endpoint, g2gPath, dstPrefix] = process.argv.slice(2);

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

var pgPath = dstPrefix + '.pg';

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

runScript('./src/g2g_to_pg.js', afterPg, endpoint, g2gPath, pgPath);

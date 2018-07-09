#!/usr/bin/env node

// USAGE: $ node g2g.js <rq|pg|neo|pgx|dot> <g2g_path> <endpoint|local_file> <output_dir(optional)>
// TODO: add option to use a local file

var fs = require('fs');
var common = require('./common.js');
var path = require('path');

[dstFormat, g2gPath, dataSrc, dstDir] = process.argv.slice(2);

var inputName = common.removeExtension(path.basename(g2gPath));

if(dstDir == undefined) dstDir = './output/' + inputName;

const SPARQL_DIR = dstDir + '/sparql/';
var pgPath = dstDir + '/' + inputName + '.pg';


common.mkdirPath(dstDir);
common.mkdirPath(SPARQL_DIR);

function afterSparql(err) {
  if(err) throw err;
  if(dstFormat != 'rq') {
    //common.runScript('./sparql_to_pg.js', afterPg, dataSrc, SPARQL_DIR, dstDir + "/tsv/", pgPath);
    common.runSpawnSync('sparql_to_pg', afterPg, dataSrc, SPARQL_DIR, dstDir + "/tsv/", pgPath);
  } else {
    console.log('Done.');
  }
}


function afterPg(err) {
  if(err) throw err;
  // TODO: output this log only if pg has been sucessfully created
  console.log('"' + pgPath + '" has been created.');
  switch(dstFormat) {
    case 'neo':
    var neoDir = dstDir + "/neo/";
    common.mkdirPath(neoDir);
    //common.runScript('./pg_to_neo.js', (err) => {if(err) throw err;}, pgPath, neoDir + inputName);
    common.runSpawnSync('pg_to_neo', (err) => {if(err) throw err;}, pgPath, neoDir + inputName);
    break;
    case 'pgx':
    var pgxDir = dstDir + "/pgx/";
    common.mkdirPath(pgxDir);
    //common.runScript('./pg_to_pgx.js', (err) => {if(err) throw err;}, pgPath, pgxDir + inputName);
    common.runSpawnSync('pg_to_pgx', (err) => {if(err) throw err;}, pgPath, pgxDir + inputName);
    break;
    case 'dot':
    //common.runScript('./pg_to_dot.js', (err) => {if(err) throw err;}, pgPath, dstDir + '/' + inputName);
    common.runSpawnSync('pg_to_dot', (err) => {if(err) throw err;}, pgPath, dstDir + '/' + inputName);
    break;
    case 'pg':
    console.log('Done.');
    break;
  }
}

//common.runScript('./g2g_to_sparql.js', afterSparql, g2gPath, SPARQL_DIR);
common.runSpawnSync('g2g_to_sparql', afterSparql, g2gPath, SPARQL_DIR);

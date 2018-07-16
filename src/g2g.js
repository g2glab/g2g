#!/usr/bin/env node

var fs = require('fs');
var common = require('./common.js');
var path = require('path');
var commander = require('commander').version(require("../package.json").version)
    .arguments('<g2gml_file> <data_source>')
    .action(function (g2gml_file, data_source) {
      g2gPath = g2gml_file;
      dataSrc = data_source;
    })
    .option('-f, --format [format]', 'format of results <rq|pg|pgx|neo|dot|all (default: pg)>', /^(rq|pg|pgx|neo|dot|all)$/i)
    .option('-o, --output_dir [prefix]', 'directory where results are output (default: output/<input_prefix>)');

commander.parse(process.argv)

if(commander.args.length === 0) {
  console.error("Error: no arguments are given!");
  commander.help();
}

var inputName = common.removeExtension(path.basename(g2gPath));
var dstDir = commander.output_dir || './output/' + inputName;

if(commander.format === undefined) {
  var dstFormat = 'pg'; // default value
} else if(commander.format === true) {
  console.error('Error: invalid format!');
  commander.help();
} else {
  var dstFormat = commander.format;
}

const SPARQL_DIR = dstDir + '/sparql/';
var pgPath = dstDir + '/' + inputName + '.pg';


common.mkdirPath(dstDir);
common.mkdirPath(SPARQL_DIR);

function afterSparql(err) {
  if(err) throw err;
  if(dstFormat != 'rq') {
    common.runSpawnSync('sparql_to_pg', afterPg, dataSrc, SPARQL_DIR, dstDir + "/tsv/", pgPath);
  } else {
    console.log('Done.');
  }
}


function afterPg(err) {
  if(err) throw err;
  // TODO: output this log only if pg has been sucessfully created
  console.log('"' + pgPath + '" has been created.');
  var neoDir = dstDir + "/neo/";
  var pgxDir = dstDir + "/pgx/";
  switch(dstFormat) {
    case 'neo':
    common.mkdirPath(neoDir);
    common.runSpawnSync('pg_to_neo', (err) => {if(err) throw err;}, pgPath, neoDir + inputName);
    break;
    case 'pgx':
    common.mkdirPath(pgxDir);
    common.runSpawnSync('pg_to_pgx', (err) => {if(err) throw err;}, pgPath, pgxDir + inputName);
    break;
    case 'dot':
    common.runSpawnSync('pg_to_dot', (err) => {if(err) throw err;}, pgPath, dstDir + '/' + inputName);
    break;
    case 'pg':
    console.log('Done.');
    break;
    case 'all':
    common.mkdirPath(neoDir);
    common.runSpawnSync('pg_to_neo', (err) => {if(err) throw err;}, pgPath, neoDir + inputName);
    common.mkdirPath(pgxDir);
    common.runSpawnSync('pg_to_pgx', (err) => {if(err) throw err;}, pgPath, pgxDir + inputName);
    common.runSpawnSync('pg_to_dot', (err) => {if(err) throw err;}, pgPath, dstDir + '/' + inputName);
    break;
  }
}

common.runSpawnSync('g2g_to_sparql', afterSparql, g2gPath, SPARQL_DIR);

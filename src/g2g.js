#!/usr/bin/env node

var fs = require('fs');
var common = require('./common.js');
var path = require('path');
var g2gmlToSparql = require('./g2g_to_sparql.js');
var commander = require('commander').version(require("../package.json").version)
    .arguments('<g2gml_file> <data_source>')
    .action(function (g2gml_file, data_source) {
      g2gPath = g2gml_file;
      dataSrc = data_source;
    })
    .option('-f, --format [format]', 'format of results <rq|pg|json|pgx|neo|dot|aws|all (default: pg)>', /^(rq|pg|json|pgx|neo|dot|aws|all)$/i)
    .option('-o, --output_dir [prefix]', 'directory where results are output (default: output/<input_prefix>)')
    .option('--paginate [page_count]', 'count of rows in each page for pagination mode (default: 10000, negative means no pagination)', parseInt);

commander.parse(process.argv)

if(commander.args.length === 0) {
  console.error("Error: no arguments are given!");
  commander.help();
}

var pageSize = commander.paginate || 10000;

var inputName = common.removeExtension(path.basename(g2gPath));
var dstDir = commander.output_dir || './output/' + inputName;

if(commander.format === true) {
  console.error('Error: invalid format!');
  commander.help();
} 
var dstFormat = commander.format || 'pg';

const SPARQL_DIR = dstDir + '/sparql/';
var pgPath = dstDir + '/' + inputName + '.pg';

common.mkdirPath(dstDir);
common.removeRecursive(SPARQL_DIR);
common.mkdirPath(SPARQL_DIR);

function afterSparql(err) {
  if(err) return;
  if(dstFormat != 'rq') {
    common.runSpawnSync('sparql_to_pg', afterPg, dataSrc, SPARQL_DIR, dstDir + "/tsv/", pgPath, pageSize);
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
  var awsDir = dstDir + "/aws/";
  switch(dstFormat) {
    case 'neo':
    common.mkdirPath(neoDir);
    common.runSpawnSync('pg2neo', (err) => {if(err) throw err;}, pgPath, '-o', neoDir);
    break;
    case 'pgx':
    common.mkdirPath(pgxDir);
    common.runSpawnSync('pg2pgx', (err) => {if(err) throw err;}, pgPath, '-o', pgxDir);
    break;
    case 'aws':
    common.mkdirPath(awsDir);
    common.runSpawnSync('pg2aws', (err) => {if(err) throw err;}, pgPath, '-o', awsDir);
    break;
    case 'dot':
    common.runSpawnSync('pg2dot', (err) => {if(err) throw err;}, pgPath, '-o', dstDir);
    break;
    case 'json':
    common.runSpawnSync('pg2json', (err) => {if(err) throw err;}, pgPath, '-o', dstDir);
    break;
    case 'pg':
    console.log('Done.');
    break;
    case 'all':
    common.mkdirPath(neoDir);
    common.runSpawnSync('pg2neo', (err) => {if(err) throw err;}, pgPath, '-o', neoDir);
    common.mkdirPath(pgxDir);
    common.runSpawnSync('pg2pgx', (err) => {if(err) throw err;}, pgPath, '-o', pgxDir);
    common.mkdirPath(awsDir);
    common.runSpawnSync('pg2aws', (err) => {if(err) throw err;}, pgPath, '-o', awsDir);
    common.runSpawnSync('pg2dot', (err) => {if(err) throw err;}, pgPath, '-o', dstDir);
    break;
  }
}

common.runSpawnSync('g2g_to_sparql', afterSparql, g2gPath, SPARQL_DIR);

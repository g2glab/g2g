var assert = require('assert');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var common = require('./../src/common.js');

describe('g2g', function() {
  describe('for musician.g2g', function() {
    const END_POINT = 'http://ja.dbpedia.org/sparql';
    const G2G = 'examples/musician.g2g';
    const BASE_NAME = common.removeExtension(path.basename(G2G));
    const OUTPUT_LOC = 'test/output/' + BASE_NAME;
    describe('when "rq" is given', function() {
      it('should generate sparql files', function() {
        childProcess.execFileSync('node', ['g2g.js', 'rq', G2G, END_POINT, OUTPUT_LOC]);
        assert(fs.existsSync(OUTPUT_LOC + '/sparql'));
      });
    });

    describe('when "pg" is given', function() {
      it('should generate pg files', function() {
        childProcess.execFileSync('node', ['g2g.js', 'pg', G2G, END_POINT, OUTPUT_LOC]);
        assert(fs.existsSync(OUTPUT_LOC + '/' + BASE_NAME + '.pg'));
      });
    });

    describe('when "neo" is given', function() {
      it('should generate neo4j files', function() {
        childProcess.execFileSync('node', ['g2g.js', 'neo', G2G, END_POINT, OUTPUT_LOC]);
        assert(fs.existsSync(OUTPUT_LOC + '/neo'));
      });
    });

    describe('when "pgx" is given', function() {
      it('should generate pgx files', function() {
        childProcess.execFileSync('node', ['g2g.js', 'pgx', G2G, END_POINT, OUTPUT_LOC]);
        assert(fs.existsSync(OUTPUT_LOC + '/pgx'));
      });
    });
  });
});

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var common = require('./../src/common.js');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;

describe('g2g', function() {
  describe('for musician.g2g', function() {
    const TTL = 'examples/musician/musician.ttl';
    const G2G = 'examples/musician/musician.g2g';
    const TEST_NAME = common.removeExtension(path.basename(G2G));
    const BASE_DIR = 'test/output/';
    const OUTPUT_LOC =  BASE_DIR + TEST_NAME + '/';

    it('should generate pg file', function() {
      childProcess.execFileSync('g2g', ['-f', 'pg', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + TEST_NAME + '.pg');
    });

    it('should generate sparql files', function() {
      childProcess.execFileSync('g2g', ['-f', 'rq', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + 'sparql');
    });

    it('should generate pgx directory', function() {
      childProcess.execFileSync('g2g', ['-f', 'pgx', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + 'pgx');
    });

    it('should generate dot file', function() {
      childProcess.execFileSync('g2g', ['-f', 'dot', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + TEST_NAME + '.dot');
    });

    it('should generate neo directory when neo is specified', function() {
      childProcess.execFileSync('g2g', ['-f', 'neo', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + 'neo');
    });

    it('should generate aws directory', function() {
      childProcess.execFileSync('g2g', ['-f', 'aws', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + 'aws');
    });

    it('should generate all formats', function() {
      childProcess.execFileSync('g2g', ['-f', 'all', G2G, TTL, '-o', OUTPUT_LOC]);
      assert.pathExists(OUTPUT_LOC + 'aws');
      assert.pathExists(OUTPUT_LOC + TEST_NAME + '.pg');
      assert.pathExists(OUTPUT_LOC + TEST_NAME + '.dot');
      assert.pathExists(OUTPUT_LOC + 'neo');
      assert.pathExists(OUTPUT_LOC + 'pgx');
      assert.pathExists(OUTPUT_LOC + 'sparql');
    });

    after(function() {
      common.removeRecursive(BASE_DIR);
    });
  });
});

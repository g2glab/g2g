var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var common = require('./../src/common.js');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;

function assertEqualAsPG(actual, expected) {
  if(actual === expected) return; // They must be equal if they are the same object

  if(Array.isArray(actual)) {
    assert.isArray(expected);
    actual.forEach((a, i) => {
      assertEqualAsPG(a, expected[i]); 
    });
  } else if(actual instanceof Object) {
    assert.typeOf(actual, typeof expected);
    var aKeys = Object.keys(actual).sort();
    var eKeys = Object.keys(expected).sort();

    assert.equal(aKeys.toString(), eKeys.toString());
    Object.keys(actual).forEach(key => {
      if(key == 'labels') {
        assert.sameDeepMembers(actual[key], expected[key]);
      } else if(key == 'properties') { 
        var actual_props = actual[key];
        var expected_props = expected[key];
        Object.keys(actual_props).forEach(prop => {
          assert.sameDeepMembers(actual_props[prop], expected_props[prop]);
        });
      } else {
        assertEqualAsPG(actual[key], expected[key]);
      }
    });
  } else {
    assert.typeOf(actual, typeof expected);
    assert.equal(actual, expected);
  }
}

describe('g2g', function() {

  const EP = 'http://ja.dbpedia.org/sparql';
  const TTL = 'examples/musician/musician.ttl';
  const G2G = 'examples/musician/musician.g2g';
  const TEST_NAME = common.removeExtension(path.basename(G2G));
  const BASE_DIR = 'test/output/';
  const OUTPUT_DIR =  BASE_DIR + TEST_NAME + '/';

  describe('two modes', function() {
    it('endpoint mode', function() {
      childProcess.execFileSync('g2g', ['-f', 'pg', G2G, EP, '-o', OUTPUT_DIR + 'endpoint/']);
      assert.pathExists(OUTPUT_DIR + 'endpoint/'  + TEST_NAME + '.pg');
    });
    it('localfile mode', function() {
      childProcess.execFileSync('g2g', ['-f', 'pg', G2G, TTL, '-o', OUTPUT_DIR + 'localfile/']);
      assert.pathExists(OUTPUT_DIR + 'localfile/'  + TEST_NAME + '.pg');
    });
  });

  describe('file format', function() {

    it('should generate pg file', function() {
      childProcess.execFileSync('g2g', ['-f', 'pg', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + TEST_NAME + '.pg');
    });

    it('should generate sparql files', function() {
      childProcess.execFileSync('g2g', ['-f', 'rq', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + 'sparql');
    });

    it('should generate pgx directory', function() {
      childProcess.execFileSync('g2g', ['-f', 'pgx', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + 'pgx');
    });

    it('should generate dot file', function() {
      childProcess.execFileSync('g2g', ['-f', 'dot', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + TEST_NAME + '.dot');
    });

    it('should generate neo directory', function() {
      childProcess.execFileSync('g2g', ['-f', 'neo', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + 'neo');
    });

    it('should generate aws directory', function() {
      childProcess.execFileSync('g2g', ['-f', 'aws', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + 'aws');
    });

    it('should generate all formats', function() {
      childProcess.execFileSync('g2g', ['-f', 'all', G2G, TTL, '-o', OUTPUT_DIR]);
      assert.pathExists(OUTPUT_DIR + 'aws');
      assert.pathExists(OUTPUT_DIR + TEST_NAME + '.pg');
      assert.pathExists(OUTPUT_DIR + TEST_NAME + '.dot');
      assert.pathExists(OUTPUT_DIR + 'neo');
      assert.pathExists(OUTPUT_DIR + 'pgx');
      assert.pathExists(OUTPUT_DIR + 'sparql');
    });

    after(function() {
      common.removeRecursive(BASE_DIR);
    });
  });

  describe('JSON equality', () => {
    ["musician"].forEach( (name) => {
      it(name, () => {
        var src = path.join("examples", name, name);
        childProcess.execFileSync('g2g', ['-f', 'json', src + ".g2g", src + ".ttl", '-o', path.join(BASE_DIR, name)]);
        var actual = JSON.parse(fs.readFileSync(path.join(BASE_DIR, name, name + '.json')));
        var expected = JSON.parse(fs.readFileSync(path.join('examples', name, name + '.json')));
        assertEqualAsPG(actual, expected);
      });
    });
  });
});

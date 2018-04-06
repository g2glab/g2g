var assert = require('assert');
var common = require('./../src/common.js');
var childProcess = require('child_process');

describe('g2g', () => {
  describe('for musician.g2g', () => {
    describe('when "rq" is given', () => {
      it('should generate sparql files', () => {
        childProcess.execFileSync('node', ['g2g.js', 'rq', 'examples/musician.g2g', 'http://ja.dbpedia.org/sparql']);
      });
    });

    describe('when "pg" is given', () => {
      it('should generate pg files', () => {
        childProcess.execFileSync('node', ['g2g.js', 'pg', 'examples/musician.g2g', 'http://ja.dbpedia.org/sparql']);
      });
    });

    describe('when "neo" is given', () => {
      it('should generate neo4j files', () => {
        childProcess.execFileSync('node', ['g2g.js', 'neo', 'examples/musician.g2g', 'http://ja.dbpedia.org/sparql']);
      });
    });

    describe('when "pgx" is given', () => {
      it('should generate neo4j files', () => {
        childProcess.execFileSync('node', ['g2g.js', 'pgx', 'examples/musician.g2g', 'http://ja.dbpedia.org/sparql']);
      });
    });
  });
});

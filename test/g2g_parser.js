var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var common = require('./../src/common.js');
var g2gmlToSparql = require('./../src/g2g_to_sparql.js');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
 
var assertParseFile = function(path, expected) {
  return function() {
    assert.equal(g2gmlToSparql(path), expected);
  };
};

describe('g2g', function() {
  describe('g2gmlToSparql', function() {
    describe('valid strange g2gs', function() {
      var files = fs.readdirSync('test/valid_g2g');
      files.forEach( (file) => {
        name = path.basename(file);
        g2gPath = `test/valid_g2g/${file}`
        if(fs.existsSync(g2gPath)) {
          it(`${name} should be parsed.`,
             assertParseFile(g2gPath, true)
          );
        }
      });
    });


    describe('invalid g2gs', function() {
      var files = fs.readdirSync('test/invalid_g2g');
      files.forEach( (file) => {
        name = path.basename(file);
        g2gPath = `test/invalid_g2g/${file}`
        if(fs.existsSync(g2gPath)) {
          it(`${name} should not be parsed.`,
             assertParseFile(g2gPath, false)
          );
        }
      });
    });
  });
});

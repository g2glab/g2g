// USAGE: $ node pg_to_neo.js <pg_file> <prefix>
// OUTPUT_DIR: output/
// OUTPUT_FILES: <prefix>.neo.nodes <prefix>.neo.edges

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./src/pg_to.js');

var node_props = ['type'];
var edge_props = ['type'];
var node_props_type = ['string'];
var edge_props_type = ['string'];

var path_nodes = prefix + '.neo.nodes';
var path_edges = prefix + '.neo.edges';

fs.writeFile(path_nodes, '', function (err) {});
fs.writeFile(path_edges, '', function (err) {});

var sep = ',';

listProps(function() {
  writeHeaderNodes(function() {
    writeHeaderEdges(function() {
      writeNodesAndEdges(function() {
        console.log('"' + path_nodes + '" has been created.');
        console.log('"' + path_edges + '" has been created.');
      });
    });
  });
});

function listProps(callback) {
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      [line, types] = pg.extractTypes(line);
      var items = line.match(/"[^"]+"|[^\s:]+/g); // "...." or .... (separated by : or \s)
      pg.checkItems(items);
      if (pg.isNodeLine(line)) {
        // This line is a node
        // For each property, check if it is listed
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var type = pg.evalType(val);
          if (node_props.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            node_props.push(key);
            node_props_type.push(prop);
          }
        }
      } else {
        // This line is a edge
        // For each property, check if it is listed
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var type = pg.evalType(val);
          if (edge_props.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            edge_props.push(key);
            edge_props_type.push(prop);
          }
        }
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}

function writeHeaderNodes(callback) {
  var output = [];
  output[0] = 'id:ID';
  for (var i=0; i<node_props.length; i++) {
    if (node_props[i] == 'type') {
      output[i + 1] = ':LABEL';
    } else {
      output[i + 1] = node_props[i];
    }
  }
  fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
  callback();
}

function writeHeaderEdges(callback) {
  var output = [];
  output[0] = ':START_ID';
  output[1] = ':END_ID';
  for (var i=0; i<edge_props.length; i++) {
    if (node_props[i] == 'type') {
      output[i + 2] = ':TYPE';
    } else {
      output[i + 2] = edge_props[i];
    }
  }
  fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
  callback();
}


function writeNodesAndEdges(callback) {
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      var types;
      [line, types] = pg.extractTypes(line);
      var items = line.match(/"[^"]+"|[^\s:]+/g); // "...." or .... (separated by : or \s)
      pg.checkItems(items);
      if (pg.isNodeLine(line)) {
        // This line is a node
        var id = items[0];
        var output = [];
        output[0] = id;
        output[1] = types.join(';');
        // For each property, check its index
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var index = node_props.indexOf(key);
          if (index != -1) {
            output[index + 1] = val;
          } else {
            console.log('WARNING: This node property is not defined: ' + key);
          }
        }
        fs.appendFile(path_nodes, output.join(sep) + '\n', function (err) {});
      } else {
        // This line is a edge
        var output = [];
        output[0] = items[0]; // source node
        output[1] = items[1]; // target node
        output[2] = types[0];
        // For each property, add 1 line
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i];
          var val = items[i+1];
          var index = edge_props.indexOf(key);
          if (index != -1) {
            output[index + 2] = val;
          } else {
            console.log('WARNING: This edge property is not defined: ' + key);
          }
        }
        fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
      }
    }
  });
  rl.on('close', function() {
    callback();
  });
}

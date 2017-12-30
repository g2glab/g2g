// USAGE: $ node gpg_to_neo.js <gpg_file> <prefix>
// OUTPUT_DIR: output/
// OUTPUT_FILES: <prefix>.neo.nodes <prefix>.neo.edges

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');


var cnt_nodes = 0;
var cnt_edges = 0;

var node_props = [];
var edge_props = [];
var node_props_type = [];
var edge_props_type = [];

var file_nodes = prefix + '.neo.nodes';
var file_edges = prefix + '.neo.edges';

var path_nodes = './output/' + file_nodes;
var path_edges = './output/' + file_edges;

fs.writeFile(path_nodes, '', function (err) {});
fs.writeFile(path_edges, '', function (err) {});

var sep = ',';

var rs = fs.createReadStream(pgp_file);
var rl = readline.createInterface(rs, {});

rl.on('line', function(line) {
  if (line.charAt(0) != '#') {
    var items = line.match(/\w+|"[^"]+"/g);
    check_items(items);
    if (is_prop(line.split(/\s+/)[1])) {
      // This line is a node
      // For each property, check if it is listed
      for (var i=1; i<items.length-1; i=i+2) {
        var key = items[i];
        var val = items[i+1];
        var type = eval_type(val);
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
        var type = eval_type(val);
        if (key != 'type') {
          if (edge_props.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            edge_props.push(key);
            edge_props_type.push(prop);
          }
        }
      }
    }
  }
});

rl.on('close', function() {
  writeHeaderNodes(function() {
    writeHeaderEdges(function() {
      writeNodesAndEdges(function() {
        console.log('"' + path_nodes + '" has been created.');
        console.log('"' + path_edges + '" has been created.');
      });
    });
  });
});

var writeHeaderNodes = function(callback) {
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
};

var writeHeaderEdges = function(callback) {
  var output = [];
  output[0] = ':START_ID';
  output[1] = ':END_ID';
  for (var i=0; i<edge_props.length; i++) {
　　if (node_props[i] == '"type"') {
      output[i + 2] = ':TYPE';
    } else {
      output[i + 2] = edge_props[i];
    }
  }
  fs.appendFile(path_edges, output.join(sep) + '\n', function (err) {});
  callback();
};

var writeNodesAndEdges = function(callback) {
  var rs = fs.createReadStream(pgp_file);
  var rl = readline.createInterface(rs, {});
  rl.on('line', function(line) {
    if (line.charAt(0) != '#') {
      var items = line.match(/\w+|"[^"]+"/g);
      check_items(items);
      if (is_prop(line.split(/\s+/)[1])) {
        // This line is a node
        cnt_nodes++;
        var id = items[0];
        var output = [];
        output[0] = id;
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
      // For each property, add 1 line
      for (var i=2; i<items.length-1; i=i+2) {
        var key = items[i];
        var val = items[i+1];
        if (key == 'type') {
          output[2] = val; // type
        } else {
          var index = edge_props.indexOf(key);
          if (index != -1) {
            output[index + 2] = val;
          } else {
            console.log('WARNING: This edge property is not defined: ' + key);
          }
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

function check_items(items) {
  for(var i=0; i<items.length; i++){
    //items[i] = items[i].replace(/"/g,'');
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has tab(\\t): ' + items[i]);
    }
  }
};

function is_prop(str) {
  arr = str.match(/\w+|"[^"]+"/g);
  if (arr.length > 1 && arr[0] != '') {
    return true;
  } else {
    return false;
  }
};

function eval_type(str) {
  if (is_string(str)) {
    return 'string';
  } else {
    return 'double';
  }
};

function is_string(str) {
  if (typeof str == 'string') {
    return true;
  } else {
    return false;
  }
};

function is_integer(x) {
  return Math.round(x) === x;
};

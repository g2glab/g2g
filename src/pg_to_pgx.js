// USAGE: $ node pg_to_pgx.js <pg_file> <prefix>
// EXAMPLE: $ node pg_to_pgx.js example/musician.pg output/musician/musician
// OUTPUT_FILES: <prefix>.opv <prefix>.ope <prefix>.json

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');

var rs = fs.createReadStream(pgp_file);
var rl = readline.createInterface(rs, {});

var cnt_nodes = 0;
var cnt_edges = 0;

var node_props = [];
var edge_props = [];
var node_props_type = [];
var edge_props_type = [];

var file_nodes = prefix + '.pgx.nodes';
var file_edges = prefix + '.pgx.edges';
var file_config = prefix + '.pgx.json';

var sep = ',';

fs.writeFile(file_nodes, '', function (err) {});
fs.writeFile(file_edges, '', function (err) {});
fs.writeFile(file_config, '', function (err) {});

rl.on('line', function(line) {
  if (line.charAt(0) != '#') {
    var items = line.match(/"[^"]+"|[^\s:]+/g); // .... or "..(inc. : or \s).." (separated by : or \s)
    checkItems(items);
    if (isProp(line.split(/\s+/)[1])) {
      // This line is a node
      cnt_nodes++;
      var id = items[0];
      if (items.length == 1) {
        // When this node has no property
        var output = [];
        output[0] = id;
        output[1] = '%20'; // %20 means 'no property' in PGX syntax
        output = output.concat(format('', 'none'));
        fs.appendFile(file_nodes, output.join(sep) + '\n', function (err) {});
      } else {
        // For each property, add 1 line
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i]; 
          var val = items[i+1];
          var type = evalType(val);
          var output = [];
          output[0] = id;
          output[1] = key;
          output = output.concat(format(val, type));
          fs.appendFile(file_nodes, output.join(sep) + '\n', function (err) {});
          if (node_props.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            node_props.push(key); 
            node_props_type.push(prop); 
          }
        }
      }
    } else {
      // This line is a edge
      cnt_edges++;
      var label;
      // Find "type" property and store as "label"
      for (var i=2; i<items.length-1; i=i+2) {
        if (items[i] == 'type') {
          label = items[i+1];
        }
      }
      if (items.length == 4) {
        // When this edge has no property
        var output = [];
        output[0] = cnt_edges; // edge id
        output[1] = items[0]; // source node
        output[2] = items[1]; // target node
        output[3] = label;
        output[4] = '%20';
        output = output.concat(format('', 'none'));
        fs.appendFile(file_edges, output.join(sep) + '\n', function (err) {});
      } else {
        // For each property, add 1 line
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i]; 
          var val = items[i+1];
          if (key != 'type') {
            var output = [];
            output[0] = cnt_edges; // edge id
            output[1] = items[0]; // source node
            output[2] = items[1]; // target node
            output[3] = label;
            output[4] = key;
            var type = evalType(val);
            output = output.concat(format(val, type));
            fs.appendFile(file_edges, output.join(sep) + '\n', function (err) {});
            if (edge_props.indexOf(key) == -1) {
              var prop = { name: key, type: type };
              edge_props.push(key); 
              edge_props_type.push(prop); 
            }
          }
        }
      }
    }
  }
});

rl.on('close', function() {
  console.log('"' + file_nodes + '" has been created.');
  console.log('"' + file_edges + '" has been created.');
  createLoadConfig();
});

function createLoadConfig() {
  var config = {
    vertex_uri_list: [ filename(file_nodes) ]
  , edge_uri_list: [ filename(file_edges) ]
  , format: "flat_file"
  , node_id_type: "string"
  , edge_label: true
  , vertex_props: node_props_type
  , edge_props: edge_props_type
  , separator: sep
  , loading: {
      load_edge_label:true
    }
  };
  fs.appendFile(file_config, JSON.stringify(config), function (err) {});
  console.log('"' + file_config + '" has been created.');
}

function filename(path) {
  return path.replace(/^.*[\\\/]/, '');
}

function checkItems(items) {
  for(var i=0; i<items.length; i++){
    items[i] = items[i].replace(/"/g,'');
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has tab(\\t): ' + items[i]);
    }
  }
};

function isProp(str) {
  arr = str.match(/"[^"]+"|[^:]+/g);
  if (arr.length > 1 && arr[0] != '') {
    return true;
  } else {
    return false;
  } 
};

function evalType(str) {
  if (isNaN(str)) {
    return 'string';
  } else {
    if (isInteger(Number(str))) {
      return 'integer';
    } else {
      return 'double';
    }
  }
};

function isInteger(num) {
  return Math.round(num) === num;
};

function format(str, type) {
  var output = [];
  if (type == 'none') {
    output[0] = '';
    output[1] = '';
    output[2] = '';
    output[3] = '';
  } else if (type == 'string') {
    output[0] = '1';
    output[1] = str;
    output[2] = '';
    output[3] = '';
  } else if (type == 'integer') {
    output[0] = '2';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'float') {
    output[0] = '3';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'double') {
    output[0] = '4';
    output[1] = '';
    output[2] = str;
    output[3] = '';
  } else if (type == 'datetime') {
    output[0] = '5';
    output[1] = '';
    output[2] = '';
    output[3] = str;
  } else if (type == 'datetime') {
    output[0] = '6';
    output[1] = str;
    output[2] = '';
    output[3] = '';
  }
  return output;
};


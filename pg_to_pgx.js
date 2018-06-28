// USAGE: $ node pg_to_pgx.js <pg_file> <prefix>
// EXAMPLE: $ node pg_to_pgx.js example/musician.pg output/musician/musician
// OUTPUT_FILES: <prefix>.opv <prefix>.ope <prefix>.json

var pgp_file = process.argv[2];
var prefix = process.argv[3];

var fs = require('fs');
var readline = require('readline');
var pg = require('./src/pg_to.js');

var rs = fs.createReadStream(pgp_file);
var rl = readline.createInterface(rs, {});

var cnt_nodes = 0;
var cnt_edges = 0;

var arr_node_prop = [];
var arr_edge_prop = [];
var arr_node_prop_type = [];
var arr_edge_prop_type = [];

var file_nodes = prefix + '.pgx.nodes';
var file_edges = prefix + '.pgx.edges';
var file_config = prefix + '.pgx.json';

var sep = ',';

fs.writeFile(file_nodes, '', function (err) {});
fs.writeFile(file_edges, '', function (err) {});
fs.writeFile(file_config, '', function (err) {});

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

rl.on('line', function(line) {
  if (line.charAt(0) != '#') {
    var types;
    [line, types] = pg.extractTypes(line);
    var items = line.match(/"[^"]+"|[^\s:]+/g);
    pg.checkItems(items);
    //items = items.map(item => item.replace(/"/g,'')); // remove double quotes
    //types = types.map(type => type.replace(/"/g,'')); // remove double quotes
    if (pg.isNodeLine(line)) {
      // This line is a node
      var id = items[0].replace(/"/g,'');
      // For each property, add 1 line
      items = items.concat(flatten(types.map(type => ['type', type])));
      cnt_nodes++;
      if (items.length == 1) {
        // When this node has no property
        var output = [];
        output[0] = id;
        output[1] = '%20'; // %20 means 'no property' in PGX syntax
        output = output.concat(format('', 'none'));
        fs.appendFile(file_nodes, output.join(sep) + '\n', function (err) {});
      } else {
        for (var i=1; i<items.length-1; i=i+2) {
          var key = items[i].replace(/"/g,''); 
          var val = items[i+1].replace(/"/g,'');
          var type = pg.evalType(items[i+1]);
          var output = [];
          output[0] = id;
          output[1] = key;
          output = output.concat(format(val, type));
          fs.appendFile(file_nodes, output.join(sep) + '\n', function (err) {});
          if (arr_node_prop.indexOf(key) == -1) {
            var prop = { name: key, type: type };
            arr_node_prop.push(key); 
            arr_node_prop_type.push(prop); 
          }
        }
      }
    } else {
      // This line is a edge
      cnt_edges++;
      var label = types[0].replace(/"/g,'');
      if (items.length == 4) {
        // When this edge has no property
        var output = [];
        output[0] = cnt_edges; // edge id
        output[1] = items[0].replace(/"/g,''); // source node
        output[2] = items[1].replace(/"/g,''); // target node
        output[3] = label;
        output[4] = '%20';
        output = output.concat(format('', 'none'));
        fs.appendFile(file_edges, output.join(sep) + '\n', function (err) {});
      } else {
        // For each property, add 1 line
        for (var i=2; i<items.length-1; i=i+2) {
          var key = items[i].replace(/"/g,''); 
          var val = items[i+1].replace(/"/g,'');
          if (key != 'type') {
            var output = [];
            output[0] = cnt_edges; // edge id
            output[1] = items[0].replace(/"/g,''); // source node
            output[2] = items[1].replace(/"/g,''); // target node
            output[3] = label;
            output[4] = key;
            var type = pg.evalType(items[i+1]);
            output = output.concat(format(val, type));
            fs.appendFile(file_edges, output.join(sep) + '\n', function (err) {});
            if (arr_edge_prop.indexOf(key) == -1) {
              var prop = { name: key, type: type };
              arr_edge_prop.push(key); 
              arr_edge_prop_type.push(prop); 
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
  , vertex_props: arr_node_prop_type
  , edge_props: arr_edge_prop_type
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


// USAGE: $ node g2gml_to_sparql.js <g2g_file> <out_prefix>

var g2gmlPath = process.argv[2];
var outPrefix = process.argv[3];

var yaml = require('js-yaml');
var fs = require('fs');

g2gmlToSparql(g2gmlPath, outPrefix);

function g2gmlToSparql(g2gmlPath, outPrefix) {
  var prefixPart = "";
  var sparqlList = [];
  var g2g = yaml.safeLoad(fs.readFileSync(g2gmlPath, 'utf8'));
  for(let key in g2g) {
    var value = g2g[key];
    switch(key) {
    case 'nodes':
      nodeSparql = createNodeSparql(value);
      break;
    case 'edges':
      edgeSparql = createEdgeSparql(value);
      break;
    default:
      if(key.startsWith('PREFIX')){
        prefixPart += key+': ' + value + '\n';
      } else {
        throw 'invalid entry: ' + key;
      }
      break;
    }
  }

  var nodeFileName = outPrefix + '_nodes.sql';
  fs.writeFileSync(nodeFileName,
               prefixPart + nodeSparql,
               'utf8');
  var edgeFileName = outPrefix + '_edges.sql';
  fs.writeFileSync(edgeFileName,
               prefixPart + edgeSparql,
               'utf8');
  console.log('Created "' + nodeFileName + '" and "' + edgeFileName + '".');
}

function createNodeSparql(nodes) {
  var listOfClassSparqlList = Object.keys(nodes).map((className) => createClassSparqlList(className, nodes[className]));
  return 'SELECT \n' +
    '  ?s AS ?nid \n' +
    '  ?p AS ?property \n' +
    '  ?o AS ?value \n' +
    'WHERE {{ \n' +
    flatten(listOfClassSparqlList)
    .join('} Union { \n') +
    '}} \n';
}

function flatten(array) {
  return array.reduce(function (p, c) {
      return Array.isArray(c) ? p.concat(flatten(c)) : p.concat(c);
    }, []);
};

function createClassSparqlList(className, classObject) {
  if(!classObject.hasOwnProperty('type') ) {
    throw className + ' does not have "type" line';
  }
  var sparqlList = [];
  var typeLine = '    ' + transformSandO(classObject['type']) + '. \n';

  for(property in classObject) {
    if(property == 'type') continue;
    let selectPart =
      '  SELECT            \n' + 
      '    ?s              \n' + 
      '    "' + property + '"  AS ?p\n' +
      '    ?o             \n';
    let wherePart =
      '  WHERE {           \n' +
      typeLine +
      '    ' + transformSandO(classObject[property], property) + '\n' +
      '  }\n';
    sparqlList.push(selectPart + wherePart);
  }
  return sparqlList;
}

function transformSandO(srcString, oName) {
  return srcString.split(' ').map(
    (token) => token == 'S'?'?s':(token=='O'?'?o':token))
    .join(' ');
}

function createEdgeSparql(edges) {
  var edgeSparqlList = 
    Object.keys(edges).map(function(edge){
      var declaration = parseEdgeDeclaration(edge);
      return '  SELECT\n' +
             '    ?' + declaration.src + ' AS ?s_nid\n' +
             '    ?' + declaration.dst + ' AS ?d_nid\n' +
             '    "' + declaration.name + '" AS ?label\n' +
             '  WHERE {\n' +
             '    ' + edges[edge] + '\n' +
             '  }\n';
      });
      
  return 'SELECT *\n' +
         'WHERE {{ \n' +
         edgeSparqlList.join('} Union { \n') +
         '}} \n';
}

function parseEdgeDeclaration(declaration) {
  var arguments;
  var name;
  var argStart = declaration.indexOf('(');
  if(argStart == -1) {
    throw '"' + declaration + '" has no arguments';
  } else {
    arguments = declaration.substring(argStart + 1, declaration.length - 1).split(',');
    name = declaration.substring(0, argStart - 1);
    if(arguments.length != 2) {
      throw '"' + declaration + '" has wrong number of arguments';
    }
  }
  return {name: name,
      src: arguments[0].trim(),
      dst: arguments[1].trim()};
}

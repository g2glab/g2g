exports.g2gmlToSparql = g2gmlToSparql

const REQUIRED = "match";
const SRC = "SN";
const DST = "DN";
const SUBJECT = "S";
const OBJECT = "O";

var fs = require('fs');
var path = require('path');

function g2gmlToSparql(g2gmlPath, dstLocation) {
  var prefixPart = "";
  var blocks = [];
  var g2g = fs.readFileSync(g2gmlPath, 'utf8').toString();
  const NODES = 'nodes';
  const EDGES = 'edges';
  var inPrefix = true;
  var currentBlock = [];
  g2g.split('\n').forEach(
    (line) => {
      if(line.startsWith('#')) return;
      if(line.trim().length == 0) {
        inPrefix = false;
        return;
      }
      if(inPrefix) prefixPart += line + '\n';
      else {
        if(!line.startsWith(' ') && currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
        currentBlock += line;
      }
    }
  )
  [node2Sparql, edge2Sparql] = parseBlocks(blocks);
  var nodeFiles = writeSparqlFiles(node2Sparql, dstLocation, prefixPart, 'nodes');
  var edgeFiles = writeSparqlFiles(edge2Sparql, dstLocation, prefixPart, 'edges');
  return [nodeFiles, edgeFiles];
}

function parseBlocks(blocks) {
  var header = blocks[0];
  var whereClauses = blocks.slice(1, blocks.length);
  [nodeDeclaration, edgeDeclaration] = parseDeclaration(header);
}

function parseDeclaration(header) {
  var edgeRegex = /\((.+)\)\-\[(.+)\]\-\((.+)\)/;
  var matched = header.match(edgeRegex)
  if(matched) {
    return [null, { node1: parseElement(matched[1]),
                    edge: parseElement(matched[2]),
                    node2: parseElement(matched[3]) } ];
  }
  else return [parseElement(header.slice(1, header.length - 1)), null];
}

function parseElement(element) {
  
}

function writeSparqlFiles(name2SparqlMap, dstLocation, header, suffix) {
  return Object.keys(name2SparqlMap).map(
    (name) =>
      {
        var fileName = dstLocation + name + '_' + suffix + '.sql';
        fs.writeFileSync(fileName,  header + name2SparqlMap[name], 'utf8');
        console.log('"' + fileName + '" has been created.');
        return fileName;
      }
  );
}

function createNodeSparqlMap(nodes) {
  var map = {};
  Object.keys(nodes).forEach(
    (node) => {
      map[node] = 'SELECT\n' +
        '  ?S AS ?nid \n' +
        '  "' + node + '" AS ?type \n' + 
        Object.keys(nodes[node]).map(
          (prop, index) =>
            (prop == REQUIRED ? '' : 
            '  "' + prop + '" AS ?P' + index + '\n' +
            '  ?O' + index + '\n')
        ).join('') + 
      createWherePhrase(nodes[node]);
    });
  return map;
}

function createWherePhrase(nodeObject) {
  conditionList = 
    Object.keys(nodeObject).map(
      (node, index) => '  ' +  
        (node == REQUIRED ?
          toVariable(nodeObject[node], index) :
          'OPTIONAL {' + toVariable(nodeObject[node], index) + '}'));
return 'WHERE { \n' +
    conditionList.join(' .\n') +
   '\n}';
}


function toVariable(srcString, index) {
  return srcString.split(' ').map((token) =>
    (token == SUBJECT ? '?' + SUBJECT :
    (token == OBJECT ? '?' + OBJECT + index : token))).join(' ');
}


function createEdgeSparqlMap(edges, nodes) {
  var map = {};
  Object.keys(edges).forEach(
    (edge) => {
      var edgeDcl = parseEdgeDeclaration(edge);
      map[edgeDcl.name] = 'SELECT\n' +
        '  ?SN\n' +
        '  ?DN\n' +
        '  "' + edgeDcl.name + '" AS ?type \n' + 
        Object.keys(edges[edge]).map(
          (prop, index) =>
            (prop == REQUIRED ? '' : 
            '  "' + prop + '" AS ?P' + index + '\n' +
            '  ?O' + index + '\n')
        ).join('') + 
      createEdgeWherePhrase(edges[edge], edgeDcl, nodes);
    });
  return map;
}

function createEdgeWherePhrase(edgeObject, edgeDcl, nodes) {
  conditionList = 
    Object.keys(edgeObject).map(
      (prop, index) => '  ' +  
        (prop == REQUIRED ?
          toVariable(edgeObject[prop], index) :
          'OPTIONAL {' + toVariable(edgeObject[prop], index, true) + '}'));
return 'WHERE { \n  ' +
    nodes[edgeDcl.src][REQUIRED].replace(SUBJECT, '?' + SRC) + ('.\n  ') +
    nodes[edgeDcl.dst][REQUIRED].replace(SUBJECT, '?' + DST) + ('.\n') +
    conditionList.join(' .\n') +
   '\n}';
}


function toVariable(srcString, index, toSrc) {
  if(toSrc) srcString = srcString.replace(/(\W|^)S(\W|$)/g, '$1SN$2');
  return srcString.replace(/(\W|^)(S|SN|DN)(\W|$)/g, '$1?$2$3')
           .replace(/(\W|^)O(\W|$)/g, '$1?O'+index+'$2')
}

function parseEdgeDeclaration(declaration) {
  var arguments;
  var name;
  var argStart = declaration.indexOf('(');
  if(argStart == -1) {
    throw '"' + declaration + '" has no arguments';
  } else {
    arguments = declaration.substring(argStart + 1, declaration.length - 1).split(',');
    name = declaration.substring(0, argStart);
    if(arguments.length != 2) {
      throw '"' + declaration + '" has wrong number of arguments';
    }
  }
  return {name: name,
      src: arguments[0].trim(),
      dst: arguments[1].trim()};
}

// for test
g2gmlToSparql('./examples/musician_sparql.g2g', '')

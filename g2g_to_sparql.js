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
  g2g.split(/\r\n|\r|\n/).forEach(
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
        currentBlock.push(line);
      }
    }
  )
  if(currentBlock.length > 0) blocks.push(currentBlock);
  var node2Sparql, edge2Sparql;
  [node2Sparql, edge2Sparql] = parseBlocks(blocks);
  var nodeFiles = writeSparqlFiles(node2Sparql, dstLocation, prefixPart, 'nodes');
  var edgeFiles = writeSparqlFiles(edge2Sparql, dstLocation, prefixPart, 'edges');
  return [nodeFiles, edgeFiles];
}

function edgeSelectClause(edge, nodes) {
  var node1Required = replaceVariableInRequired(edge.node1, nodes);
  var node2Required = replaceVariableInRequired(edge.node2, nodes);
  return 'SELECT\n' +
    '  ?' + edge.node1.variable + ' \n' +
    '  ?' + edge.node2.variable + ' \n' +
    '  "' + edge.label.name + '" AS ?type \n' +
    edge.properties.map(
      (prop, index) =>
        '  "' + prop.name + '" AS ?P' + index + '\n' +
        '  ?' + prop.variable + '\n').join('') +
    '  WHERE {\n' + 
    node1Required + '\n' + 
    node2Required + '\n' + 
    edge.where.join('\n') +
    '}\n';
    
}

// TODO: Local variables in sparqls of nodes should be added some prefix to avoid conflict with native variable in edges
function replaceVariableInRequired(newNode, nodes) {
  return nodes[newNode.name].required.join('\n').replace(new RegExp(nodes[newNode.name].label.variable,"g"), newNode.variable);
}

function nodeSelectClause(nodeDefinition) {
  return 'SELECT\n' +
    '  ?' + nodeDefinition.label.variable + ' AS ?nid \n' +
    '  "' + nodeDefinition.label.name + '" AS ?type \n' + 
    nodeDefinition.properties.map(
      (prop, index) =>
        '  "' + prop.name + '" AS ?P' + index + '\n' +
        '  ?' + prop.variable + '\n').join('') +
    '  WHERE { \n' + 
    nodeDefinition.where.join('\n') +
    '}\n';
}

// {nodes: {<name>: {required: ~, where: ~, label: {}, properties: []}, edges: {<name>: {node1: {name: ~, variable: ~ }, where: ~, node2: {}, label: {name: ~. props: []}} }
function parseBlocks(blocks) {
  var map = {nodes: {}, edges: {}};
  blocks.forEach((block) => parseBlock(block, map));

  var nodeSparqls = {};
  var edgeSparqls = {};

  Object.keys(map.nodes).forEach( (node) => {
    nodeSparqls[node] = nodeSelectClause(map.nodes[node]); 
  });

  Object.keys(map.edges).forEach( (edge) => {
    edgeSparqls[edge] = edgeSelectClause(map.edges[edge], map.nodes); 
  });
  return [nodeSparqls, edgeSparqls];
}

function parseBlock(block, map) {
  var header = block[0];
  var whereClauses = block.slice(1, block.length);
  var nodeDeclaration, edgeDeclaration;
  [nodeDeclaration, edgeDeclaration] = parseDeclaration(header);
  if(nodeDeclaration != null) {
    var requiredClauses = whereClauses.filter((line) => !line.trim().startsWith('OPTIONAL'));
    map.nodes[nodeDeclaration.label.name] = {required: requiredClauses,
                                              where: whereClauses,
                                              label: nodeDeclaration.label,
                                              properties: nodeDeclaration.properties};
  } else {
    edgeDeclaration.where = whereClauses;
    map.edges[edgeDeclaration.label.name] = edgeDeclaration;
  }
}

function parseDeclaration(header) {
  //var edgeRegex = /\((.+)\)\-\[(.+)\]\-\((.+)\)/;
  var edgeRegex = /\((.+)\)\-\[(.+)\]-\((.+)\)/;
  var matched = header.match(edgeRegex)
  if(matched) {
    var edgeMap = parseElement(matched[2]);
    edgeMap.node1 = parseElement(matched[1]).label;
    edgeMap.node2 = parseElement(matched[3]).label;
    return [null, edgeMap];
  }
  else return [parseElement(header.slice(1, header.length - 1)), null];
}

// input: string like "<variable>:<label> {<variable>:<property> (, <variable>:<property>)*}"
// output: object like {label: {name: <label>, variable: <variable>}, properties: [{name: <label>, variable: <variable>}, ...] }
function parseElement(element) {
  var labelPart, propertyPart, labelVariable, labelName;
  [labelPart, propertyPart] = element.split('{');
  var result = {};
  var label_var, label_name;
  [label_var, label_name] = parseKeyValue(labelPart);
  result.label = {name: label_name, variable: label_var};
  if(propertyPart != null) {
    propertyPart = propertyPart.replace('}', '');
    result.properties = propertyPart.split(',').map((property) => {
                          var prop_var, prop_name;
                          [prop_name, prop_var] = parseKeyValue(property);
                          return {name: prop_name, variable: prop_var};
                        });
  } else {
    result.properties = [];
  }
  return result;
}

// input: string like "<key>:<value>"
function parseKeyValue(kv) {
  return kv.split(':').map((str) => str.trim());
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

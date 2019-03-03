#!/usr/bin/env node

// USAGE: $ g2g_to_sparql <g2g_file>

var fs = require('fs');
var path = require('path');

var SPARQL_DIR = process.argv[3];

var g2gPath = process.argv[2];

var inputName = path.basename(g2gPath);

function g2gmlToSparql(g2gmlPath, dstLocation) {
  var prefixPart = "";
  var blocks = [];
  var g2g = fs.readFileSync(g2gmlPath, 'utf8').toString();
  var currentBlock = [];
  g2g.split(/\r\n|\r|\n/).forEach(
    (line) => {
      if(line.startsWith('#')) return;
      if(line.startsWith('PREFIX')) prefixPart += line + '\n';
      else if(line.trim().length > 0) {
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
  var whereClause = edge.where.join('\n');
  whereClause = addNodeRequired(whereClause, edge.node1, nodes, getVariables(whereClause));
  whereClause = addNodeRequired(whereClause, edge.node2, nodes, getVariables(whereClause));
  return 'SELECT' + ' ?' + edge.node1.variable + ' ?' + edge.node2.variable + ' ("' + edge.label.name + '" AS ?type)'
    + ' ("' + edge.undirected + '" AS ?undirected)\n' +
    edge.properties.map(
      (prop, index) =>
        '       ("' + prop.name + '" AS ?P' + index + ')' + ' (SAMPLE(?' + prop.variable + ') AS ?_' + prop.variable + ')\n').join('') +
    'WHERE {\n' +
    whereClause + '\n' +
    '}\n' +
    'GROUP BY ?' + edge.node1.variable + ' ?' + edge.node2.variable + '\n';
}

// TODO: Local variables in sparqls of nodes should be added some prefix to avoid conflict with native variable in edges
function addNodeRequired(whereClause, addedNode, nodes, existingVars) {
  var nodeDef = nodes[addedNode.name]
  var required = nodeDef.required.join('\n');
  existingVars = existingVars.filter((v) => v != "?" + addedNode.variable);
  var replaced = replaceVariable(required, "?" + nodeDef.label.variable, "?" + addedNode.variable);
  [replaced, _] = replaceConflictVars(replaced, existingVars);
  return whereClause + '\n\n' + replaced;
}

function replaceConflictVars(clause, existingVars) {
  var localVars = getVariables(clause);
  var varsToReplace = [];
  localVars.forEach( (v) => {
    if(!existingVars.includes(v)) return;
    var newName = v + '_';
    while(existingVars.includes(newName)) {
      newName += '_';
    }
    varsToReplace.push({from: v, to: newName});
    existingVars.push(newName);
  });
  var replaced = clause;
  varsToReplace.forEach((v) => {
    replaced = replaceVariable(replaced, v.from, v.to);
  });
  return [replaced, varsToReplace];
}

function replaceVariable(srcStr, from, to) {
  return srcStr.replace(new RegExp('(\\W|^)\\'+ from + '(\\W|$)', "g"), '$1' + to + '$2');
}

function createEdgeConstraintForNode(existingConstraints, edge, targetEdgeNode, anotherEdgeNode, nodeVar, nodes) {
  nodeVar = "?" + nodeVar;
  var existingVars = getVariables(existingConstraints);
  [constraint, varsToReplace] = replaceConflictVars(edge.required.join('\n'), existingVars.filter((v) => v != "?" + targetEdgeNode.variable));
  constraint = replaceVariable(constraint, "?" + targetEdgeNode.variable, nodeVar);
  anotherEdgeNode = Object.assign({}, anotherEdgeNode); // clone
  varsToReplace.forEach((v) => {
                        if(v.from == "?" + anotherEdgeNode.variable){
                          anotherEdgeNode.variable = v.to.replace("?", "");
                        }
  });
  constraint = addNodeRequired(constraint, anotherEdgeNode, nodes, existingVars, true);
  return constraint;
}

function nodeSelectClause(nodeDefinition, edges, nodes) {
  whereClause = nodeDefinition.where.join('\n') + '\n';
  edgeConstraints = []
  Object.keys(edges).forEach( (edge_name) => {
    var edge = edges[edge_name];
    if(edge.node1.name == nodeDefinition.label.name) {
      edgeConstraints.push(
        createEdgeConstraintForNode(whereClause + edgeConstraints.join('\n'), edge,
                                    edge.node1, edge.node2, nodeDefinition.label.variable, nodes));
    }
    if(edge.node2.name == nodeDefinition.label.name) {
      edgeConstraints.push(
        createEdgeConstraintForNode(whereClause + edgeConstraints.join('\n'), edge,
                                    edge.node2, edge.node1, nodeDefinition.label.variable, nodes));
    }
  });
  whereClause += edgeConstraints.map((c) => '{\n' + c + '\n}').join('\nUNION\n');

  return 'SELECT' + ' (?' + nodeDefinition.label.variable + ' AS ?nid) ' + '("' + nodeDefinition.label.name + '" AS ?type)\n' + 
    nodeDefinition.properties.map(
      (prop, index) =>
        '       ("' + prop.name + '" AS ?P' + index + ') (SAMPLE(?' + prop.variable + ') AS ?_' + prop.variable + ')\n').join('') +
    'WHERE {\n' + 
      whereClause + '\n' +
    
    '}\n' +
    'GROUP BY ?' + nodeDefinition.label.variable + '\n';
}

function parseBlocks(blocks) {
  var map = {nodes: {}, edges: {}};
  blocks.forEach((block) => parseBlock(block, map));

  var nodeSparqls = {};
  var edgeSparqls = {};

  Object.keys(map.nodes).forEach( (node) => {
    nodeSparqls[node] = nodeSelectClause(map.nodes[node], map.edges, map.nodes); 
  });

  Object.keys(map.edges).forEach( (edge) => {
    edgeSparqls[edge] = edgeSelectClause(map.edges[edge], map.nodes); 
  });
  return [nodeSparqls, edgeSparqls];
}

function parseBlock(block, map) {
  var whereClauses = block.slice(1, block.length);
  var nodeDeclaration, edgeDeclaration;
  [nodeDeclaration, edgeDeclaration] = parseDeclaration(block[0]);
  var requiredClauses = whereClauses.filter((line) => !line.trim().startsWith('OPTIONAL'));
  if(nodeDeclaration != null) {
    map.nodes[nodeDeclaration.label.name] = {required: requiredClauses,
                                              where: whereClauses,
                                              label: nodeDeclaration.label,
                                              properties: nodeDeclaration.properties};
  } else {
    edgeDeclaration.where = whereClauses;
    edgeDeclaration.required = requiredClauses;
    map.edges[edgeDeclaration.label.name] = edgeDeclaration;
  }
}

function unique(array) {
  return array.filter((x, index, array) => array.indexOf(x) == index);
}

function getVariables(str) {
  //TODO: remove question mark from name of variables
  var vars = [];
  var regex = /(\?.+?)\W/g
  var matched = regex.exec(str);
  while(matched) {
    vars.push(matched[1]);
    matched = regex.exec(str);
  }
  return unique(vars);
}

function parseDeclaration(decl) {
  var edgeRegex = /\((.+)\)\-\[(.+)\](->|-)\((.+)\)/;
  var matched = decl.match(edgeRegex)
  if(matched) {
    var edge = parseElement(matched[2]);
    edge.node1 = parseElement(matched[1]).label;
    edge.node2 = parseElement(matched[4]).label;
    edge.undirected = matched[3] == '-';
    return [null, edge];
  }
  else return [parseElement(decl.slice(1, decl.length - 1)), null];
}

// input: string like "<var_0>:<label> {(<var_i>:<prop_i>, ...)}"
// output: object like {label: {name: <label>, variable: <var_0>}, properties: [{name: <prop_i>, variable: <var_i>}, ...] }
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

function writeSparqlFiles(name2SparqlMap, dstLocation, header, fileNamePrefix) {
  return Object.keys(name2SparqlMap).map(
    (name) =>
      {
        var fileName = dstLocation + fileNamePrefix + '.' + name + '.rq';
        fs.writeFileSync(fileName,  header + '\n' + name2SparqlMap[name], 'utf8');
        console.log('"' + fileName + '" has been created.');
        return fileName;
      }
  );
}

g2gmlToSparql(g2gPath, SPARQL_DIR);

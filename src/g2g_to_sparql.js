#!/usr/bin/env node

// USAGE: $ g2g_to_sparql <g2g_file>

module.exports = g2gmlToSparql;

var fs = require('fs');
var path = require('path');
var tty = require('tty');

var peg = require('./parser.js');
var comment_parser = require('./comment_parser.js');
var common = require('./common.js');


function g2gmlToSparql(g2gmlPath, dstLocation) {
  var prefixPart = "";
  var blocks = [];
  var g2g = fs.readFileSync(g2gmlPath, 'utf8').toString();
  var currentBlock = [];
  var originalG2g = g2g;
  g2g = comment_parser.parse(g2g); // remove comments
  try {
    var parseResult = peg.parse(g2g);
    prefixPart = parseResult.prefixes.join("\n");
    var node2Sparql = {}, edge2Sparql = {};

    parseResult.mappings.forEach((mapping) =>
    {
      var mappingName = mapping.pg.label;
      if(mapping.type == 'node') {
        node2Sparql[mappingName] = generateNodeSparql(mapping, parseResult.mappings);
      } else {
        edge2Sparql[mappingName] = generateEdgeSparql(mapping, parseResult.mappings);
      }
    });

    if(dstLocation) {
      writeSparqlFiles(node2Sparql, dstLocation, prefixPart, 'nodes');
      writeSparqlFiles(edge2Sparql, dstLocation, prefixPart, 'edges');
    }
    return true;
  } catch (e) {
    if (e instanceof peg.SyntaxError) {
      console.log(prettyErrorMessage(e, originalG2g));
      return false;
    } else {
      throw e;
    }
  }
}

// TODO: Local variables in sparqls of nodes should be added some prefix to avoid conflict with native variable in edges
function addNodeRequired(whereClause, addedNode, allMappings, existingVars) {
  for(i = 0; i < allMappings.length; i++) {
    var mapping = allMappings[i];
    if(mapping.type == 'node' && mapping.pg.label == addedNode.label) {
      var required = requiredClause(mapping.rdf);
      existingVars = existingVars.filter((v) => v != "?" + addedNode.variable);
      var replaced = replaceVariable(required, "?" + mapping.pg.variable, "?" + addedNode.variable);
      [replaced, _] = replaceDuplicateVars(replaced, existingVars);
      return whereClause + '\n\n' + replaced;
    }
  }
  //TODO: throw exception
}

function replaceDuplicateVars(clause, existingVars) {
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

function requiredClause(constraints) {
  return constraints.filter((line) => !line.trim().startsWith('OPTIONAL')).join('\n');
}

function createEdgeConstraintForNode(existingConstraints, edgeMapping, nodeVar, nodes, forSrc) {
  var targetEdgeNode = forSrc ? edgeMapping.pg.src : edgeMapping.pg.dst;
  var anotherEdgeNode = forSrc ? edgeMapping.pg.dst : edgeMapping.pg.src;
  var existingVars = getVariables(existingConstraints);
  nodeVar = "?" + nodeVar;

  [constraint, varsToReplace] = replaceDuplicateVars(requiredClause(edgeMapping.rdf), existingVars.filter((v) => v != "?" + targetEdgeNode.variable));
  constraint = replaceVariable(constraint, "?" + targetEdgeNode.variable, nodeVar);
  anotherEdgeNode = Object.assign({}, anotherEdgeNode); // clone
  varsToReplace.forEach((v) => {
    if(v.from == "?" + anotherEdgeNode.variable){
      anotherEdgeNode.variable = v.to.replace("?", "");
    }
  });
  existingVars = existingVars.concat(getVariables(constraint));
  constraint = addNodeRequired(constraint, anotherEdgeNode, nodes, existingVars);
  return constraint;
}

function generateEdgeSparql(mapping, allMappings) {
  var whereClause = mapping.rdf.join('\n');
  whereClause = addNodeRequired(whereClause, mapping.pg.src, allMappings, getVariables(whereClause));
  whereClause = addNodeRequired(whereClause, mapping.pg.dst, allMappings, getVariables(whereClause));
  if(mapping.pg.undirected) {
    whereClause += `\nFILTER(STR(?${mapping.pg.src.variable}) < STR(?${mapping.pg.dst.variable})).`
  }
  var subqueryPrefix = `SELECT ?${mapping.pg.src.variable} ?${mapping.pg.dst.variable} ?type ?undirected\n` + 
      mapping.pg.properties.map(
        (prop, index) =>
          `       ?P${index} ?_${prop.val}\n`
      ).join('') + ' WHERE { {\n';
  return subqueryPrefix + `SELECT ?${mapping.pg.src.variable} ?${mapping.pg.dst.variable} ("${mapping.pg.label}" AS ?type)`
    + ` ("${mapping.pg.undirected}" AS ?undirected)\n`
    + mapping.pg.properties.map(
      (prop, index) =>
        `       ("${prop.key}" AS ?P${index}) (group_concat(distinct ?${prop.val};separator="${common.g2g_separator}") AS ?_${prop.val})\n`).join('') +
    `WHERE {\n${whereClause}\n}\n` +
    `GROUP BY ?${mapping.pg.src.variable} ?${mapping.pg.dst.variable}\n` + 
    `ORDER BY ?${mapping.pg.src.variable} ?${mapping.pg.dst.variable}\n } \n }`;
}

function generateNodeSparql(mapping, allMappings) {
  var whereClause = mapping.rdf.join('\n');
  var edgeConstraints = [];
  allMappings.forEach( (anotherMapping) => {
    if(anotherMapping.type == 'edge'){
      if(anotherMapping.pg.src.label == mapping.pg.label) {
        edgeConstraints.push(
          createEdgeConstraintForNode(whereClause + edgeConstraints.join('\n'), anotherMapping, mapping.pg.variable, allMappings, true));
      }
      if(anotherMapping.pg.dst.label == mapping.pg.label) {
        edgeConstraints.push(
          createEdgeConstraintForNode(whereClause + edgeConstraints.join('\n'), anotherMapping, mapping.pg.variable, allMappings, false));
      }
    }
  });
  whereClause += '\n' + edgeConstraints.map((c) => '{\n' + c + '\n}').join('\nUNION\n');
  // Surround with select to trick Virtuoso
  var subqueryPrefix = `SELECT ?nid ?type \n` + 
      mapping.pg.properties.map(
        (prop, index) =>
          `       ?P${index} ?_${prop.val}\n`
      ).join('') + ' WHERE { {\n';
  return subqueryPrefix + `SELECT (?${mapping.pg.variable} AS ?nid) ("${mapping.pg.label}" AS ?type)\n` +
      mapping.pg.properties.map(
        (prop, index) =>
          `       ("${prop.key}" AS ?P${index}) (group_concat(distinct ?${prop.val};separator="${common.g2g_separator}") AS ?_${prop.val})\n`
      ).join('') +
    `WHERE {\n ${whereClause} \n}\n` +
    `GROUP BY ?${mapping.pg.variable}\n` + 
    `ORDER BY ?${mapping.pg.variable}\n } }`;
}

function unique(array) {
  return array.filter((x, index, array) => array.indexOf(x) == index);
}

function getVariables(str) {
  var vars = [];
  var regex = /(\?.+?)\W/g
  var matched = regex.exec(str);
  while(matched) {
    vars.push(matched[1]);
    matched = regex.exec(str);
  }
  return unique(vars);
}

function writeSparqlFiles(name2SparqlMap, dstLocation, header, fileNamePrefix) {
  return Object.keys(name2SparqlMap).map(
    (name) =>
      {
        var fileName = dstLocation + fileNamePrefix + '.' + name + '.rq';
        fs.writeFileSync(fileName,  header + '\n\n' + name2SparqlMap[name], 'utf8');
        console.log('"' + fileName + '" has been created.');
        return fileName;
      }
  );
}



function prettyErrorMessage(e, src)
{
  var delimiterWidth = 30;
  var message = 'Syntax error!\n\n';
  message += e.message;
  message += `\n\nlocation: line ${e.location.start.line}, column ${e.location.start.column}`;
  message += `\n${"=".repeat(delimiterWidth)}\n` // delimiter
  var lines = src.split('\n');
  var start = Math.max(0, e.location.start.line - 9);
  var end = Math.min(lines.length - 1, e.location.end.line + 7);
  message += lines.slice(start, e.location.start.line - 1).join('\n') + '\n';
  message += lines[e.location.start.line - 1].substring(0, e.location.start.column - 1);
  message += common.redText('->') + common.redBackgroundText(lines[e.location.start.line - 1].substring(e.location.start.column - 1, e.location.end.column - 1));
  message += lines[e.location.start.line - 1].substring(e.location.end.column - 1) + '\n';
  message += lines.slice(e.location.start.line, end).join('\n');
  message += `\n${"=".repeat(delimiterWidth)}\n` // delimiter
  return message;
}

if (typeof require != 'undefined' && require.main==module) {
  var SPARQL_DIR = process.argv[3];
  var g2gPath = process.argv[2];
  var inputName = path.basename(g2gPath);
  var success = g2gmlToSparql(g2gPath, SPARQL_DIR);  
  if(!success) {
    process.exit(-1);
  }
}

exports.checkItems = function (items) {
  for(var i=0; i<items.length; i++){
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has unexpected tab(\\t): [' + items[i] + '] after [' + items[i-1] + ']');
    }
  }
}


exports.isProp = function (str) {
  arr = str.match(/\w+|"[^"]+"/g);
  if (arr.length > 1 && arr[0] != '') {
    return true;
  } else {
    return false;
  }
}

exports.evalType = function (str) {
  if (isString(str)) {
    return 'string';
  } else {
    if (isInteger(Number(str))) {
      return 'integer';
    } else {
      return 'double';
    }
  }
}


exports.extractTypes = function (line) {
  var types = globalGroupMatch(line, /\s:(\w+|"[^"]+")/g).map((m) => m[1]);
  line = line.replace(/\s:(\w+|"[^"]+")/g, ''); // remove types
  return [line, types];
}

// This method assums to be called after extractTypes
exports.isNodeLine = function (line) {
  var tokens = line.split(/\s+/);
  if (tokens.length <= 1) return true;
  var str = tokens[1]; // the second item in the line
  if (isSimpleStringItem(str)) {
//  if (str.startsWith('"') && str.endsWith('"') && (str.match(/"/g) || []).length == 2) { // if it is a simple string
    return false;
  } else {
    return true;
  }
}

function isSimpleStringItem(str) {
  if (str.startsWith('"') && str.endsWith('"') && (str.match(/"/g) || []).length == 2) { // string item has to be double quoated
    return true;
  } else {
    return false;
  }
}

function globalGroupMatch(text, pattern) {
  var matchedArray = [];
  var regex = pattern;
  while(match = regex.exec(text)) {
    matchedArray.push(match);
  }
  return matchedArray;
}

function isString(str) {
  //if (typeof str == 'string') {
  if (isNaN(str)) {
    return true;
  } else {
    return false;
  }
}

function isInteger(x) {
  return Math.round(x) === x;
}



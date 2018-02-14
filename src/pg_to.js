exports.checkItems = function (items) {
  for(var i=0; i<items.length; i++){
    if (items[i].match(/\t/)) {
      console.log('WARNING: This item has tab(\\t): ' + items[i]);
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
    return 'double';
  }
}

function isString(str) {
  if (typeof str == 'string') {
    return true;
  } else {
    return false;
  }
}

function isInteger(x) {
  return Math.round(x) === x;
}

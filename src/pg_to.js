exports.test = 'hello';

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

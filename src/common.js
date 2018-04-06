var childProcess = require('child_process');

exports.runScript = (scriptPath, callback, ...args) =>
{
  // keep track of whether callback has been invoked to prevent multiple invocations
  var process = childProcess.fork(scriptPath, args);
  var invoked = false;
  // listen for errors as they may prevent the exit event from firing
  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
};

exports.mkdirPath = (path) => 
{
  childProcess.execSync('mkdir -p ' + path);
}

exports.removeRecursive = (path) => 
{
  childProcess.execSync('rm -r ' + path);
}


exports.removeExtension = (name) => 
{
  return name.substring(0, name.lastIndexOf('.')) || name;
}


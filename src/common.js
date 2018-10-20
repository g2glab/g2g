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

exports.runSpawnSync = (command, callback, ...args) =>
{
  var result = childProcess.spawnSync(command, args);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if(result.status === 0) {
    callback();
  } else {
    callback(new Error('exit code ' + result.status));
  }
}

exports.mkdirPath = (path) => 
{
  childProcess.execSync('mkdir -p ' + path);
}

exports.removeRecursive = (path) => 
{
  childProcess.execSync('rm -rf ' + path);
}

exports.removeExtension = (name) => 
{
  return name.substring(0, name.lastIndexOf('.')) || name;
}


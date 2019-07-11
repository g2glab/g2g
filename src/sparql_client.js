exports.query = query;

var request = require('request');
var fs = require('fs');

function query(endpoint, inputQuery, outFile, callback) {
  var query;
  if(fs.existsSync(inputQuery)) {
    query = fs.readFileSync(inputQuery, 'utf8');
  } else {
    query = inputQuery;
  }
  var options = {
    uri: endpoint,
    form: {query: query},
    headers:{ 
      "Accept": "text/tab-separated-values"
    }
  };
  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      var partial = 'x-sparql-maxrows' in response.headers;
      fs.writeFile(outFile, body, 'utf8', function (err) {
        if (err != null) {
          console.log(err);
        }
        callback(partial);
      });
    } else {
      console.log('error: '+ response.statusCode);
      console.log(body);
    }
  });
}

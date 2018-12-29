exports.query = query;

var request = require('request');
var fs = require('fs');

function query(endpoint, sparqlFile, outFile, callback) {
  var query = fs.readFileSync(sparqlFile, 'utf8');
  var options = {
    uri: endpoint,
    form: {query: query, format: "text/tab-separated-values"},
    headers:{ 
      "Accept": "text/tab-separated-values"
    }
  };
  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      fs.writeFile(outFile, body, 'utf8', function (err) {
        if (err != null) {
          console.log(err);
        }
        callback();
      });
    } else {
      console.log('error: '+ response.statusCode);
      console.log(body);
    }
  });
}

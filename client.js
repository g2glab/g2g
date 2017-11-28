var request = require('request');
var fs = require('fs');

function get_query(inFile, callbackFunc) {
  callbackFunc(fs.readFileSync(inFile, 'utf8'));
}


function query_sparql(endpoint, input, outFile, callbackFunc) {
  get_query(input, function(query){
    var options = {
      uri: endpoint,
      form: {query: query, format: "text/tab-separated-values"},
    };
    request.post(options, function(error, response, body){
      if (!error && response.statusCode == 200) {
        console.log('Writing file ...');
        fs.writeFile(outFile, body, 'utf8', function (err) {
          if (err == null) {
            console.log('Done.');
          } else {
            console.log(err);
          }
          callbackFunc();
        });
      } else {
        console.log('error: '+ response.statusCode);
        console.log(body);
      }
    });
  });
}

exports.query_sparql = query_sparql;

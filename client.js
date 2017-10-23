// USAGE: $ node client.js <endpoint> <query_file> <result_file>

var request = require('request');
var fs = require('fs');
var endpoint = process.argv[2];
var inFile = process.argv[3]; // Query
var outFile = process.argv[4]; // Result

// QUERY
var query = '';
function get_query(callback) {
  fs.readFile(inFile, 'utf8', function (err, text) {
    if (err == null) {
      console.log('SPARQL:\n' + text);
      query = text;
      callback();
    } else {
      console.log(err);
      console.log('Please provide SPARQL file!');
    }
  });
}

// MAIN FUNCTION TO EXECUTE QUERY
get_query(function(){
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
      });
    } else {
      console.log('error: '+ response.statusCode);
      console.log(body);
    }
  });
});

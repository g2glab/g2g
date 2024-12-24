exports.query = query;

const request = require('request');
const fs = require('fs');
const version = require('commander').version(require("../package.json").version)

function query(endpoint, inputQuery, outFile, callback) {
  let query;
  if(fs.existsSync(inputQuery)) {
    query = fs.readFileSync(inputQuery, 'utf8');
  } else {
    query = inputQuery;
  }
  const options = {
    uri: endpoint + '?timeout=0', // infinite 
    form: {query: query},
    headers:{ 
      "User-agent": `g2g/mapper${version}`, 
      "Accept": "text/tab-separated-values"
    }
  };
  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      const maxrows = response.headers['x-sparql-maxrows'];
      fs.writeFile(outFile, body, 'utf8', function (err) {
        if (err != null) {
          console.log(err);
        }
        callback(maxrows);
      });
    } else {
      console.log('error: '+ response.statusCode);
      console.log(body);
    }
  });
}

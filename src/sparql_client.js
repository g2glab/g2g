exports.query = query;

const axios = require('axios');
const fs = require('fs');
const version = require('commander').version(require("../package.json").version)

async function query(endpoint, inputQuery, outFile, callback) {
  try {
    let query;
    if (fs.existsSync(inputQuery)) {
      query = fs.readFileSync(inputQuery, 'utf8');
    } else {
      query = inputQuery;
    }

    const options = {
      url: endpoint + '?timeout=0', // infinite
      method: 'POST',
      data: new URLSearchParams({ query }),
      headers:{
        "User-agent": `g2g/mapper${version}`,
        "Accept": "text/tab-separated-values"
      }
    };

    const response = await axios(options);

    if (response.status === 200) {
      const maxrows = response.headers['x-sparql-maxrows'];
      fs.writeFile(outFile, response.data, 'utf8', function (err) {
        if (err) {
          console.log(err);
        }
        callback(maxrows);
      });
    } else {
      console.log('error: '+ response.status);
      console.log(response.data);
    }
  } catch (error) {
    console.log('Request failed:', error.message);
  }
}

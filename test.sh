#!/bin/bash

npm install js-yaml fs config request path

END_POINT=https://integbio.jp/rdf/sparql

node g2g.js pg examples/donor_mutation.g2g output/icgc $END_POINT 

cat examples/icgc.pgql | pgx

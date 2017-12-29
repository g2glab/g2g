#!/bin/bash

npm install js-yaml fs config request path

END_POINT=https://integbio.jp/rdf/sparql

node g2gml_mapper.js pgx $END_POINT examples/donor_mutation.g2g output/icgc

cat examples/icgc.pgql | pgx

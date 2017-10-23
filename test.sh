#!/bin/bash

npm install js-yaml fs require config request

mkdir output

node g2gml_to_sparql.js examples/donar_mutation.g2g output/test

END_POINT=https://integbio.jp/rdf/sparql

node client.js $END_POINT output/test_nodes.sql output/nodes.tsv
node client.js $END_POINT output/test_edges.sql output/edges.tsv

sh gpg_to_pgx.sh icgc

cat examples/icgc.pgql | pgx

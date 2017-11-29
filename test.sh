#!/bin/bash

npm install js-yaml fs config request path

mkdir output

node g2gml_to_sparql.js examples/donor_mutation.g2g output/test

END_POINT=https://integbio.jp/rdf/sparql

node client.js $END_POINT output/test_donor_nodes.sql output/donor_nodes.tsv
node client.js $END_POINT output/test_mutation_nodes.sql output/mutation_nodes.tsv
node client.js $END_POINT output/test_edges.sql output/edges.tsv

sh gpg_to_pgx.sh icgc

cat examples/icgc.pgql | pgx

node gpg_to_neo.js

rm -rf ./graph.db

neo4j-import --nodes output/donor_nodes.tsv.csv,output/mutation_nodes.tsv.csv --relationships output/edges.tsv.csv --into=./graph.db --ignore-missing-nodes --bad-tolerance 3000000

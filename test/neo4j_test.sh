#!/bin/bash

OUT_DIR=./test/output/
DB_PATH=./test/musician.db

node g2g.js neo examples/musician.g2g http://ja.dbpedia.org/sparql $OUT_DIR

neo4j-import --into $DB_PATH --nodes ${OUT_DIR}/neo/musician.neo.nodes --relationships ${OUT_DIR}/neo/musician.neo.edges 

rm -r $OUT_DIR
rm -r $DB_PATH

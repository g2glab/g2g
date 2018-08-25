#!/bin/bash

OUT_DIR=./test/output/
DB_PATH=./test/musician.db

g2g -f neo examples/musician/musician.g2g examples/musician/musician.ttl  -o $OUT_DIR

neo4j-import --into $DB_PATH --nodes ${OUT_DIR}/neo/musician.neo.nodes --relationships ${OUT_DIR}/neo/musician.neo.edges 

rm -r $OUT_DIR
rm -r $DB_PATH

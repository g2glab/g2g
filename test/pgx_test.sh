#!/bin/bash

OUT_DIR=./test/output/

g2g -f pgx examples/musician.g2g http://ja.dbpedia.org/sparql $OUT_DIR

cat ./test/musician.pgql | pgx

rm -r $OUT_DIR

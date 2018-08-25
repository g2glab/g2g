#!/bin/bash

OUT_DIR=./test/output/

g2g -f pgx examples/musician/musician.g2g examples/musician/musician.ttl -o $OUT_DIR

cat ./test/musician.pgql | pgx

rm -r $OUT_DIR

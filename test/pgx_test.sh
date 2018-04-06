OUT_DIR=./test/output/

node g2g.js pgx examples/musician.g2g http://ja.dbpedia.org/sparql $OUT_DIR

cat ./test/musician.pgql | pgx

rm -r $OUT_DIR

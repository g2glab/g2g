#!/bin/bash

./node_modules/mocha/bin/mocha --timeout=5000
if [ $? != 0 ]; then
  exit
fi

./test/example.sh mini-01
./test/example.sh mini-02
./test/example.sh mini-03
./test/example.sh mini-04
./test/example.sh mini-05

./test/pgx_test.sh
./test/neo4j_test.sh

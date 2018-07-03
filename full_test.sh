#!/bin/bash

./node_modules/mocha/bin/mocha --timeout=5000
if [ $? != 0 ]; then
  exit
fi

./test/pgx_test.sh
./test/neo4j_test.sh
./test/mini_01.sh

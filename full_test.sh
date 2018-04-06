#!/bin/bash

mocha
if [ $? != 0 ]; then
  exit
fi

./test/pgx_test.sh

./test/neo4j_test.sh

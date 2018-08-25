#!/bin/bash

./node_modules/mocha/bin/mocha --timeout=10000
if [ $? != 0 ]; then
  exit
fi

sh ./test/example.sh mini-01
sh ./test/example.sh mini-02
sh ./test/example.sh mini-03
sh ./test/example.sh mini-04
sh ./test/example.sh mini-05

./test/pgx_test.sh
./test/neo_test.sh

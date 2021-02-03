#!/bin/bash

./node_modules/mocha/bin/mocha --timeout 60000
if [ $? != 0 ]; then
  exit
fi

sh ./test/example.sh mini-01
sh ./test/example.sh mini-02
sh ./test/example.sh mini-03
sh ./test/example.sh mini-04
sh ./test/example.sh mini-05
sh ./test/example.sh mini-06
sh ./test/example.sh jobs


#!/bin/bash

./node_modules/mocha/bin/mocha
if [ $? != 0 ]; then
  exit
fi

sh ./test/example.sh mini-01
sh ./test/example.sh mini-02
sh ./test/example.sh mini-03
sh ./test/example.sh mini-04
sh ./test/example.sh mini-05
sh ./test/example.sh musician


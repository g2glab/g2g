#!/bin/bash

ID=$1

rm -r output/$ID

g2g examples/$ID/$ID.g2g examples/$ID/$ID.ttl

sort examples/$ID/$ID.pg > /tmp/expect.pg
sort output/$ID/$ID.pg   > /tmp/result.pg

diff /tmp/expect.pg /tmp/result.pg
if [ $? -eq 0 ]; then
  echo OK: $ID
fi

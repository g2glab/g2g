#!/bin/bash

ID=$1
g2g examples/$ID/$ID.g2g examples/$ID/$ID.ttl

DIFF=`diff examples/$ID/$ID.pg output/$ID/$ID.pg`

echo $DIFF

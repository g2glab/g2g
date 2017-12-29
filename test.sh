#!/bin/bash

npm install js-yaml fs config request path

END_POINT=https://integbio.jp/rdf/sparql

node g2gml_mapper.js pgp $END_POINT examples/donar_muation.g2g output/ 

node gpg_to_pgx.js icgc

cat examples/icgc.pgql | pgx

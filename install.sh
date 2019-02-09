#!/bin/bash

# change directory to the location of this script
cd `dirname $0`

# install g2gml
npm install
npm link

# install pg
cd pg
npm install
npm link

#!/bin/bash

# change directory to the location of this script
cd `dirname $0`

# install g2gml
npm install
npm link

# install pg
#git submodule update --init --recursive
git clone -b v0.3.4 https://github.com/g2glab/pg.git
cd pg
npm install
npm link

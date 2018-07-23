# G2G Mapper

## Pre-requirement

* Git
* Node
* Jena (+ Java)　* optional

## Install

    $ git clone https://github.com/g2gml/g2g.git
    $ cd g2g
    $ npm install
    $ nmp link

## Run

    $ g2g [options] <g2gml_file> <data_source>

For more information:

    $ g2g --help

### Endpoint Mode

Execute an example g2g for musicians on "ja.dbpedia.org".

    $ g2g -f pg examples/musician.g2g http://ja.dbpedia.org/sparql

### Local File Mode

If you have installed Apache Jena ARQ (https://jena.apache.org/documentation/query/index.html), you can directly handle local RDF data.
The following command converts ```examples/ttl/people.ttl``` by ```examples/people.g2g```.

    $ g2g -f pg examples/people.g2g examples/ttl/people.ttl

# G2G Mapping Engine

version 0.1.0

## Requirements

* Git
* Node
* Java + [Jena ARQ](https://jena.apache.org/documentation/query/index.html) (for local file mode)
* PG (for converting to various formats)

## Install

    $ git clone -b v0.1.0 https://github.com/g2gml/g2g.git
    $ cd g2g
    $ npm install
    $ nmp link

## Run

    $ g2g [options] <g2gml_file> <data_source>

For more information:

    $ g2g --help

### Endpoint Mode

Execute a g2g mapping against **SPARQL endpoint** "ja.dbpedia.org".

    $ g2g examples/musician.g2g http://ja.dbpedia.org/sparql

### Local File Mode

Execute a g2g mapping against **RDF data file** "people.ttl".

    $ g2g examples/people.g2g examples/ttl/people.ttl

## Docker Container

    $ docker run -v `pwd`:/shared ryotas/g2g:0.1.0 \
      g2g g2g/examples/musician/musician.g2g http://ja.dbpedia.org/sparql -o /shared/output

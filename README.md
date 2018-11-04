# G2G Mapping Engine

version 0.1.0

## Quick Start

Set an alias to run docker container:

    $ alias g2g='docker run --rm -v $PWD:/work g2gml/g2g:0.1.0 g2g'

Get example files:

    $ git clone -b v0.1.0 https://github.com/g2gml/g2g.git
    $ cd g2g

**Endpoint Mode:** g2g mapping against SPARQL endpoint *ja.dbpedia.org*.

    $ g2g examples/musician/musician.g2g http://ja.dbpedia.org/sparql

**Local File Mode:** g2g mapping against RDF data file *mini-01.ttl*.

    $ g2g examples/mini-01/mini-01.g2g examples/mini-01/mini-01.ttl

For more information:

    $ g2g --help

## Local Installation

Requirements:

* Git
* Node
* Java JDK 8 + [Jena ARQ](https://jena.apache.org/documentation/query/index.html) (for local file mode)
* [PG](https://github.com/g2gml/pg) (for converting to various formats)

Install:

    $ git clone -b v0.1.0 https://github.com/g2gml/g2g.git
    $ cd g2g
    $ npm install
    $ npm link

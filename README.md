# G2G Mapper

version 0.2.0

## Quick Start

Set an alias to run docker container:

    $ alias g2g='docker run --rm -v $PWD:/work g2gml/g2g:0.2.0 g2g'

Run in **endpoint mode** (mapping against SPARQL endpoint *ja.dbpedia.org*):

    $ # Get example g2g file
    $ wget https://raw.githubusercontent.com/g2gml/g2g/master/examples/musician/musician.g2g
    $ # Run
    $ g2g musician.g2g http://ja.dbpedia.org/sparql

Run in **local file mode** (mapping against RDF data file *mini-01.ttl*):

    $ # Get example turtle file.
    $ https://raw.githubusercontent.com/g2gml/g2g/master/examples/mini-05/mini-05.ttl
    $ # Get example g2g file
    $ https://raw.githubusercontent.com/g2gml/g2g/master/examples/mini-05/mini-05.g2g
    $ # Run
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

    $ git clone -b v0.2.0 https://github.com/g2gml/g2g.git
    $ cd g2g
    $ npm install
    $ npm link

# G2G Mapper

version 0.2.1

## Quick Start

Set an alias to run docker container:

    $ alias g2g='docker run --rm -v $PWD:/work g2gml/g2g:0.2.1 g2g'

**Endpoint mode**

Download example g2g file:

    $ wget https://raw.githubusercontent.com/g2gml/g2g/master/examples/musician/musician.g2g
    
Run (mapping against SPARQL endpoint):

    $ g2g musician.g2g http://ja.dbpedia.org/sparql

**Local file mode**

Download example turtle file:

    $ wget https://raw.githubusercontent.com/g2gml/g2g/master/examples/mini-05/mini-05.ttl
    
Download example g2g file:

    $ wget https://raw.githubusercontent.com/g2gml/g2g/master/examples/mini-05/mini-05.g2g
    
Run (mapping against RDF data file):

    $ g2g mini-01.g2g mini-01.ttl

For more information:

    $ g2g --help

## Local Installation

Requirements:

* Git
* Node
* Java JDK 8 + [Jena ARQ](https://jena.apache.org/documentation/query/index.html) (for local file mode)
* [PG](https://github.com/g2gml/pg) (for converting to various formats)

Install:

    $ git clone -b v0.2.1 https://github.com/g2gml/g2g.git
    $ cd g2g
    $ npm install
    $ npm link

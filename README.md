# G2GML

G2GML: Semantic Graph to Property Graph Mapping Language

## Getting Started

Go into the project directory.

    $ cd g2gml

Install modules by npm.

    $ npm install
    $ nmp link

Command syntax is as follows.

    $ g2g [options] <g2g_file> <rdf_file|endpoint_url >

**Endpoint Mode:**

Execute an example g2g for musicians on "ja.dbpedia.org".

    $ g2g -f pg examples/musician.g2g http://ja.dbpedia.org/sparql

**Local File Mode:**

If you have installed Apache Jena ARQ (https://jena.apache.org/documentation/query/index.html), you can directly handle local RDF data.
The following command converts ```examples/ttl/people.ttl``` by ```examples/people.g2g```.

    $ g2g -f pg examples/people.g2g examples/ttl/people.ttl

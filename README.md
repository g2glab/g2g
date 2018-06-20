# G2GML

G2GML: Semantic Graph to Property Graph Mapping Language

## Getting Started

Go into the project directory.
```
$ cd g2gml
```

Install modules by npm.
```
$ npm install
```

Command syntax is as follows.

    $ node g2g.js <output_format> <g2g_mapping_file> <endpoint_url>
    $ node g2g.js <output_format> <g2g_mapping_file> <local_rdf_file>

**Endpoint Mode:**

Execute an example g2g for musicians on "ja.dbpedia.org".

```
$ node g2g.js pg examples/musician.g2g http://ja.dbpedia.org/sparql output/musician/
```

**Local File Mode:**

If you have installed Apache Jena ARQ (https://jena.apache.org/documentation/query/index.html), you can directly handle local RDF data.
The following command converts ```examples/ttl/people.ttl``` by ```examples/people.g2g```.

```
$ node g2g.js pg examples/people.g2g examples/ttl/people.ttl
```



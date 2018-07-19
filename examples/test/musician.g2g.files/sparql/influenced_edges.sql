PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prop-ja: <http://ja.dbpedia.org/property/>
PREFIX schema: <http://schema.org/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT
  ?mus1
  ?mus2
  "influenced" AS ?type
  
  WHERE {
      ?mus1 dbpedia-owl:influenced ?mus2 .    ?mus1 rdf:type foaf:Person, dbpedia-owl:MusicalArtist .
      ?mus1 rdfs:label ?nam .
      FILTER regex(str(?nam), "^A.*") .
      FILTER(lang(?nam) = "ja") .    ?mus2 rdf:type foaf:Person, dbpedia-owl:MusicalArtist .
      ?mus2 rdfs:label ?nam_ .
      FILTER regex(str(?nam_), "^A.*") .
      FILTER(lang(?nam_) = "ja") .
  }
  GROUP BY ?mus1 ?mus2 ?type
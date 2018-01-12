PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prop-ja: <http://ja.dbpedia.org/property/>
PREFIX schema: <http://schema.org/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT
  ?mus AS ?nid 
  "Musician" AS ?type 
  "label" AS ?P0
  SAMPLE(?nam)
  "born" AS ?P1
  SAMPLE(?dat)
  "hometown" AS ?P2
  SAMPLE(?twn)
  "pageLength" AS ?P3
  SAMPLE(?len)
  WHERE { 
    ?mus rdf:type foaf:Person, dbpedia-owl:MusicalArtist .
    ?mus rdfs:label ?nam .
    FILTER regex(str(?nam), "^A.*") .
    FILTER(lang(?nam) = "ja") .
    OPTIONAL { ?mus prop-ja:born ?dat }
    OPTIONAL { ?mus dbpedia-owl:hometown / rdfs:label ?twn }
    OPTIONAL { ?mus dbpedia-owl:wikiPageLength ?len }
}  GROUP BY ?mus
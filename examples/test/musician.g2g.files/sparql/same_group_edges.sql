PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX prop-ja: <http://ja.dbpedia.org/property/>
PREFIX schema: <http://schema.org/>
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
SELECT
  ?mus1
  ?mus2
  "same_group" AS ?type
  "label" AS ?P0
  SAMPLE(?nam)
  "hometown" AS ?P1
  SAMPLE(?twn)
  "pageLength" AS ?P2
  SAMPLE(?len)
  WHERE {
      ?grp a schema:MusicGroup ;
           dbpedia-owl:bandMember ?mus1 , ?mus2 .
      FILTER(?mus1 != ?mus2)
      OPTIONAL { ?grp rdfs:label ?nam. FILTER(lang(?nam) = "ja")}
      OPTIONAL { ?grp dbpedia-owl:hometown / rdfs:label ?twn }
      OPTIONAL { ?grp dbpedia-owl:wikiPageLength ?len }    ?mus1 rdf:type foaf:Person, dbpedia-owl:MusicalArtist .
      ?mus1 rdfs:label ?nam_ .
      FILTER regex(str(?nam_), "^A.*") .
      FILTER(lang(?nam_) = "ja") .    ?mus2 rdf:type foaf:Person, dbpedia-owl:MusicalArtist .
      ?mus2 rdfs:label ?nam__ .
      FILTER regex(str(?nam__), "^A.*") .
      FILTER(lang(?nam__) = "ja") .
  }
  GROUP BY ?mus1 ?mus2 ?type
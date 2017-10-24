sed -e "s/\"//g" output/nodes.tsv |\
sed -e "s/[\/|.|:]/_/g" |\
awk -v OFS=',' '{if (NR != 1) printf("MERGE(node:%s) SET node.%s = \"%s\";\n", $1, $2, $3)}' > output/$1_nodes.cph

sed -e "s/\"//g" output/edges.tsv |\
sed -e "s/[\/|.|:]/_/g" |\
awk -v OFS=',' '{if (NR != 1) printf("MATCH (a:%s),(b:%s) CREATE (a)-[r:%s]->(b);\n", $1, $2, $3)}' > output/$1_edges.cph
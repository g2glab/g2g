
sed -e "s/\"//g" output/nodes.tsv |\
sed -e "s/[\/|.|:]/_/g" |\
awk -v OFS=',' '{if (NR != 1) print $1,$2,1,$3,"",""}' > output/$1.opv

sed -e "s/\"//g" output/edges.tsv |\
sed -e "s/[\/|.|:]/_/g" |\
awk -v OFS=',' '{if (NR != 1) print NR,$1,$2,$3,"label","1",$3,"",""}' > output/$1.ope


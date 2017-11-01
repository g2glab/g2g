rm -f output/$1.opv
rm -f output/$1.ope

for node in `ls output/*nodes.tsv`
do
    sed -e "s/\"//g" $node |\
        sed -e "s/[\/|.|:]/_/g" |\
        awk -v OFS=',' '{if (NR != 1) print $1,$2,1,$3,"",""}' >> output/$1.opv
done


for edge in `ls output/*edges.tsv`
do
    sed -e "s/\"//g" $edge |\
        sed -e "s/[\/|.|:]/_/g" |\
        awk -v OFS=',' '{if (NR != 1) print NR,$1,$2,$3,"label","1",$3,"",""}' >> output/$1.ope
done


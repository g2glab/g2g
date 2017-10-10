var fs = require('fs');

rows = fs.readFileSync(process.argv[2], 'utf8').split('\n');
rows.shift();
tableMap = {};
properties = new Set();
rows.forEach((row) =>
             {
               data = row.split('\t');
               if(data.length < 2) return;
               if(!tableMap[data[0]])
               {
                 tableMap[data[0]] = {};
               }
               tableMap[data[0]][data[1]] = data[2]
               properties.add(data[1]);
             });

properties = Array.from(properties);
result = "nid:ID,name," + properties.join() + "\n";
result += Object.keys(tableMap).map((key) =>
                                    {
                                      return key + ',' + key + ',' + properties.map((prop) => {return tableMap[key][prop];}).join(',');
                                    }).join('\n');

fs.writeFileSync(process.argv[3], result, 'utf8');

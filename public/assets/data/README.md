# Topojson definitions for UK electoral and postcode regions


## To merge two definitions

```
cd react
npm install --save-dev topojson-client
npm install --save-dev geojson-merge

cd assets/data

# Make a copy of the GB and NI European Electoral Regions topojson file
cp -v uk-electoral-topojson/gb/topo_eer.json gb_eer.json
cp -v uk-electoral-topojson/ni/topo_eer.json ni_eer.json

# Conver to geoJSON
../../node_modules/.bin/topo2geo eer=gb_eer_geo.json < gb_eer.json
../../node_modules/.bin/topo2geo NI_Outline=ni_eer_geo.json < ni_eer.json

# Merge in the Northern Ireland
../../node_modules/.bin/geojson-merge ni_eer_geo.json gb_eer_geo.json > uk_eer_geo.json

# Convert back to topojson
../../node_modules/.bin/geo2topo uk_eer_geo.json > uk_eer.json

# Simplify the resulting file
../../node_modules/.bin/toposimplify -o uk_eer_simple.json -P 0.05 uk_eer.json
```
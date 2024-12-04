var fs = require("fs");
// Parse and type the input JSON
var jsonString = fs.readFileSync("districts.json", "utf8");
var data = JSON.parse(jsonString);
// Create the GeoJSON structure
var geoJson = {
    type: "FeatureCollection",
    features: Object.entries(data.distric).map(function (_a) {
        var name = _a[0], district = _a[1];
        return ({
            type: "Feature",
            properties: {
                name: name,
                province: district.province,
                population_2012: district.population["2012"]
            },
            geometry: {
                type: "Polygon",
                coordinates: district.coordinates || []
            }
        });
    })
};
// Write the GeoJSON to a file
fs.writeFileSync("districtsGeo.json", JSON.stringify(geoJson, null, 2));
console.log("GeoJSON file created successfully!");

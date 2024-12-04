const fs = require("fs");

// Define the input type for the original JSON
interface DistrictData {
  distric: {
    [districtName: string]: {
      province: string;
      population: {
        [year: string]: number;
      };
      coordinates?: number[][][];
    };
  };
}

// Define the GeoJSON structure
interface GeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    province: string;
    population_2012: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

interface GeoJSON {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Parse and type the input JSON
const jsonString = fs.readFileSync("districts.json", "utf8");
const data: DistrictData = JSON.parse(jsonString) as DistrictData;

// Create the GeoJSON structure
const geoJson: GeoJSON = {
  type: "FeatureCollection",
  features: Object.entries(data.distric).map(([name, district]) => ({
    type: "Feature",
    properties: {
      name,
      province: district.province,
      population_2012: district.population["2012"],
    },
    geometry: {
      type: "Polygon",
      coordinates: district.coordinates || [], // Use coordinates if available
    },
  })),
};

// Write the GeoJSON to a file
fs.writeFileSync("districtsGeo.json", JSON.stringify(geoJson, null, 2));
console.log("GeoJSON file created successfully!");

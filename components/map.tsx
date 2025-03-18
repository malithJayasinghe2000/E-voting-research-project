import React, { useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from "highcharts/modules/map";
import mapData from "@highcharts/map-collection/countries/lk/lk-all.topo.json";

// Initialize the map module
if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

interface DistrictData {
  key: string;
  name: string;
  value: number;
  color: string;
}

const SriLankaMap: React.FC = () => {
  useEffect(() => {
    // Election results with some predefined districts and colors
    const predefinedResults: DistrictData[] = [
      { key: "lk-bc", name: "Badulla", value: 10, color: "#FF0000" }, // Party A (Red)
      { key: "lk-mb", name: "Matale", value: 11, color: "#0000FF" }, // Party B (Blue)
      { key: "lk-ja", name: "Jaffna", value: 12, color: "#00FF00" }, // Party C (Green)
    ];

    // Map data manually configured
    const allDistricts = [
      "lk-bc", "lk-mb", "lk-ja", "lk-kl", "lk-ky", "lk-mt", "lk-nw", "lk-ap",
      "lk-pr", "lk-tc", "lk-ad", "lk-va", "lk-mp", "lk-kg", "lk-px", "lk-rn",
      "lk-gl", "lk-hb", "lk-mh", "lk-bd", "lk-mj", "lk-ke", "lk-co", "lk-gq",
      "lk-kt",
    ];

    const colorOptions = ["#FF0000", "#0000FF", "#00FF00"]; // Red, Blue, Green

    // Create random results for districts not in predefined results
    const randomResults = allDistricts.map((district) => {
      const predefinedDistrict = predefinedResults.find(
        (result) => result.key === district
      );

      if (predefinedDistrict) {
        return predefinedDistrict;
      }

      return {
        key: district,
        name: district.toUpperCase(),
        value: Math.floor(Math.random() * 100),
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      };
    });

    const data = randomResults.map((district) => ({
      "hc-key": district.key,
      value: district.value,
      color: district.color,
    }));

    // Initialize the Highcharts map
    Highcharts.mapChart("container", {
      chart: {
        map: mapData,
        margin: [0, 0, 0, 0], // Remove margins
      },
      title: {
        text: "Sri Lanka Election Results",
      },
      subtitle: {
        text: 'Source map: <a href="https://code.highcharts.com/mapdata/countries/lk/lk-all.topo.json">Sri Lanka</a>',
      },
      mapView: {
        center: [80.7718, 7.8731], // Center of Sri Lanka (longitude, latitude)
        zoom: 8, // Adjust zoom level
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: "bottom",
        },
      },
      series: [
        {
          type: "map",
          data: data,
          name: "Election Results",
          states: {
            hover: {
              color: "#BADA55", // Hover color
            },
          },
          dataLabels: {
            enabled: true,
            format: "{point.name}", // Show district names
          },
          colorKey: "color", // Use color for district visualization
        },
      ],
    });
  }, []);

  return <div id="container" style={{ height: "800px", width: "500px" }} />;
};

export default SriLankaMap;

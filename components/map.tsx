import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMap from "highcharts/modules/map";
import mapData from "@highcharts/map-collection/countries/lk/lk-all.topo.json";
import axios from "axios";

// Initialize Highcharts map module
if (typeof Highcharts === "object") {
  HighchartsMap(Highcharts);
}

// Mapping between district names and Highcharts district keys
const districtKeyMap: Record<string, string> = {
  Kurunegala: "lk-kg",
  Colombo: "lk-co",
  Gampaha: "lk-gq",
  Kandy: "lk-ky",
  Jaffna: "lk-ja",
  Matale: "lk-mb",
  Badulla: "lk-bc",
  // Add the rest as needed
};
type DistrictMapData = {
  "hc-key": string;
  value: number;
  color: string;
  winnerName: string;
};

const SriLankaMap: React.FC = () => {
  const [mapDataFromAPI, setMapDataFromAPI] = useState<DistrictMapData[]>([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const { data } = await axios.get("/api/vote/map-data"); // Call your API
        
        const processedData: any[] = [];

        // Process the API data
        for (const districtName in data) {
          const districtResult = data[districtName];
          const hcKey = districtKeyMap[districtName]; // Map district name to Highcharts key
          
          if (hcKey) {
            processedData.push({
              "hc-key": hcKey,
              value: districtResult.votes,
              color: districtResult.color,
              winnerName: districtResult.winnerName,
            });
          }
        }

        setMapDataFromAPI(processedData);
      } catch (error) {
        console.error("Error fetching map data:", error);
      }
    };

    fetchMapData();
  }, []);

  useEffect(() => {
    if (mapDataFromAPI.length === 0) return;

    Highcharts.mapChart("container", {
      chart: {
        map: mapData,
        margin: [0, 0, 0, 0],
      },
      title: {
        text: "Sri Lanka Election Results",
      },
      subtitle: {
        text: 'Source: <a href="https://code.highcharts.com/mapdata/countries/lk/lk-all.topo.json">Sri Lanka Map</a>',
      },
      mapView: {
        center: [80.7718, 7.8731],
        zoom: 8,
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: "bottom",
        },
      },
      tooltip: {
        formatter: function () {
          return `
          <b>${this.point.name}</b><br/>
          Winner: ${(this.point.options as DistrictMapData).winnerName}<br/>
          Votes: ${this.point.value}
          `;
        },
      },
      series: [
        {
          type: "map",
          data: mapDataFromAPI,
          name: "Election Results",
          states: {
            hover: {
              color: "#BADA55",
            },
          },
          dataLabels: {
            enabled: true,
            format: "{point.name}",
          },
          colorKey: "color",
        },
      ],
    });
  }, [mapDataFromAPI]);

  return <div id="container" style={{ height: "800px", width: "100%" }} />;
};

export default SriLankaMap;

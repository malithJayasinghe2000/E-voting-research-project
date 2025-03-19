import React, { useEffect, useState } from "react";
import router, { useRouter } from "next/router";
import axios from "axios";

interface District {
  name: string;
  resultsReleased: boolean;
}

const initialDistricts: District[] = [
  { name: "Colombo", resultsReleased: false },
  { name: "Gampaha", resultsReleased: false },
  { name: "Kalutara", resultsReleased: false },
  { name: "Mahanuwara", resultsReleased: false },
  { name: "Matale", resultsReleased: false },
  { name: "Nuwara Eliya", resultsReleased: false },
  { name: "Galle", resultsReleased: false },
  { name: "Matara", resultsReleased: false },
  { name: "Hambantota", resultsReleased: false },
  { name: "Jaffna", resultsReleased: false },
  { name: "Vanni", resultsReleased: false },
  { name: "Batticaloa", resultsReleased: false },
  { name: "Digamadulla", resultsReleased: false },
  { name: "Trincomalee", resultsReleased: false },
  { name: "Kurunegala", resultsReleased: false },
  { name: "Puttalam", resultsReleased: false },
  { name: "Anuradhapura", resultsReleased: false },
  { name: "Polonnaruwa", resultsReleased: false },
  { name: "Badulla", resultsReleased: false },
  { name: "Moneragala", resultsReleased: false },
  { name: "Ratnapura", resultsReleased: false },
  { name: "Kegalle", resultsReleased: false },
];

const PollingDistricts: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [voteResults, setVoteResults] = useState<any[]>([]); // new state to hold actual vote data
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get("/api/vote/fetchResults");
        const results = response.data; // full vote result objects
        setVoteResults(results);
  
        const releasedDistricts = new Set(results.map((result: any) => result.district));
        const updatedDistricts = initialDistricts.map((district) => ({
          ...district,
          resultsReleased: releasedDistricts.has(district.name),
        }));
  
        setDistricts(updatedDistricts);
      } catch (error) {
        console.error("Error fetching vote results:", error);
      }
    };
  
    fetchResults();
  }, []);
  
  const handleDistrictClick = (district: string) => {
    const districtVotes = voteResults.filter((v) => v.district === district);
    router.push({
      pathname: '/district',
      query: { district },
    }, `/district?district=${district}`, {
      shallow: true,
    });
  
    // or you can also use router state (recommended for larger objects)
    // router.push('/district', { state: { districtVotes } });
  };
  

  return (
    <div style={{ padding: "20px", background: "#F5F5F5", width: "100%" }}>
      <h3 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "#333", marginBottom: "20px" }}>
        Polling Districts
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>Available results</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            Past Results <span style={{ background: "#ccc", padding: "3px 5px", borderRadius: "4px" }}></span>
          </span>
          <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
            2024 <span style={{ background: "#FF0000", padding: "3px 5px", borderRadius: "4px" }}></span>
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        {districts.map((district, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FFFFFF",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              fontSize: "16px",
              color: "#333",
            }}
            onClick={() => handleDistrictClick(district.name)}
          >
            <span
              style={{
                backgroundColor: district.resultsReleased ? "#FF0000" : "#ccc",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            ></span>
            <span style={{ flexGrow: 1 }}>{district.name}</span>
            {district.resultsReleased && (
              <span
                style={{
                  background: "#FF0000",
                  color: "#FFFFFF",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                Released
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollingDistricts;

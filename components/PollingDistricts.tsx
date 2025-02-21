import React from "react";
import { useRouter } from "next/router";

interface District {
  name: string;
  resultsReleased: boolean;
}

const districts: District[] = [
  { name: "Colombo", resultsReleased: true },
  { name: "Gampaha", resultsReleased: false },
  { name: "Kalutara", resultsReleased: true },
  { name: "Mahanuwara", resultsReleased: false },
  { name: "Matale", resultsReleased: true },
  { name: "Nuwara Eliya", resultsReleased: false },
  { name: "Galle", resultsReleased: true },
  { name: "Matara", resultsReleased: false },
  { name: "Hambantota", resultsReleased: true },
  { name: "Jaffna", resultsReleased: false },
  { name: "Vanni", resultsReleased: true },
  { name: "Batticaloa", resultsReleased: false },
  { name: "Digamadulla", resultsReleased: true },
  { name: "Trincomalee", resultsReleased: false },
  { name: "Kurunegala", resultsReleased: true },
  { name: "Puttalam", resultsReleased: false },
  { name: "Anuradhapura", resultsReleased: true },
  { name: "Polonnaruwa", resultsReleased: false },
  { name: "Badulla", resultsReleased: true },
  { name: "Moneragala", resultsReleased: false },
  { name: "Ratnapura", resultsReleased: true },
  { name: "Kegalle", resultsReleased: false },
];

const PollingDistricts: React.FC = () => {
  const router = useRouter();

  const handleDistrictClick = (district: string) => {
    router.push(`/district`);
  };

  return (
    <div style={{ padding: "20px", background: "#F5F5F5", width: "100%" }}>
      <h3 style={{ textAlign: "center",fontSize: "20px",fontWeight: "bold", color: "#333", marginBottom: "20px" }}>
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
        <span style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}>Available results</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <span style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}>
            Past Results <span style={{ background: "#ccc", padding: "3px 5px", borderRadius: "4px" }}></span>
          </span>
          <span style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#333",
                }}>
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

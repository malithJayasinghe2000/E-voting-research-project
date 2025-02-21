import React from "react";

interface Division {
  name: string;
  candidates: { name: string; votes: number; percentage: number; color: string }[];
}

interface PollingDivisionsProps {
  divisions: Division[];
}

const PollingDivisions: React.FC<PollingDivisionsProps> = ({ divisions }) => {
  return (
<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
  <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
    Polling Divisions
  </h3>
  <div
    style={{
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "flex-start",
       // Ensures alignment even for single items in the last row
       width:"full"
    }}
  >
    {divisions.map((division, index) => (
      <div
        key={index}
        className="division-card"
        style={{
          flex: "1 1 calc(50% - 20px)", // Ensure consistent card width
          maxWidth: "calc(50% - 20px)", // Prevent cards from stretching
          background: "#FFFFFF",
          border: "1px solid #EAEAEA",
          borderRadius: "8px",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          padding: "15px",
        }}
      >
        {/* Division Name */}
        <h4
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "15px",
          }}
        >
          {division.name}
        </h4>

        {/* Candidates Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {division.candidates.map((candidate, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px",
                background: "#F9F9F9",
                borderRadius: "6px",
              }}
            >
              {/* Candidate Details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#000000",
                    }}
                  >
                    {candidate.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Votes: {candidate.votes.toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {candidate.percentage.toFixed(2)}%
                </div>
              </div>

              {/* Percentage Bar */}
              <div
                style={{
                  height: "10px",
                  background: "#EAEAEA",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${candidate.percentage}%`,
                    background: candidate.color,
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>


  );
};

export default PollingDivisions;

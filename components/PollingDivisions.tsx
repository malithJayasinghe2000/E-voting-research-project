import React from "react";

interface Candidate {
  name: string;
  party: string;
  votes: number;
  percentage: number;
  color: string;
}

interface Division {
  name: string;
  candidates: Candidate[];
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
          width: "100%",
        }}
      >
        {divisions.map((division, index) => (
          <div
            key={index}
            className="division-card"
            style={{
              flex: "1 1 calc(50% - 20px)",
              maxWidth: "calc(50% - 20px)",
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
                    border: `1px solid ${candidate.color}`,
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
                        {candidate.name} ({candidate.party})
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
                      {Number(candidate.percentage).toFixed(2)}%
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
                        width: `${Number(candidate.percentage)}%`,
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

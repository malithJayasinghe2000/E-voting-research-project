import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Candidate {
  name: string;
  party: string;
  votes: number;
  percentage: number;
  color: string;
  imageUrl:string
}

interface DistrictResultsProps {
  candidates: Candidate[];
  totalVotes: number;
}

const DistrictResults: React.FC<DistrictResultsProps> = ({ candidates, totalVotes }) => {
  return (
    <div style={{ padding: "20px" }}>


      {/* Main Content */}
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        {/* Results Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {candidates.map((candidate, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "15px",
                background: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                width: "600px",
              }}
            >
              {/* Candidate Details Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                {/* Candidate Image */}
                <img
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    marginRight: "15px",
                  }}
                />

                {/* Candidate Information */}
                <div style={{ flexGrow: 1 }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#000000",
                      marginBottom: "5px",
                    }}
                  >
                    {candidate.name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    {candidate.party}
                  </div>
                </div>

                {/* Vote Count */}
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {candidate.votes.toLocaleString()}
                </div>
              </div>

              {/* Percentage Bar */}
              <div
                style={{
                  height: "10px",
                  background: "#EAEAEA",
                  borderRadius: "4px",
                  position: "relative",
                  overflow: "hidden",
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

              {/* Percentage Text */}
              <div
                style={{
                  textAlign: "right",
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "5px",
                }}
              >
                {candidate.percentage.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart Section */}
        <div style={{ flex: 1 }}>
          <PieChart width={330} height={400}>
            <Pie
              data={candidates}
              dataKey="votes"
              nameKey="party"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.party}: ${entry.percentage.toFixed(1)}%`}
            >
              {candidates.map((candidate, index) => (
                <Cell key={`cell-${index}`} fill={candidate.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>

  );
};

export default DistrictResults;

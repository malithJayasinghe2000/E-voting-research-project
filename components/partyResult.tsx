import React from "react";

interface CandidateResult {
  candidateName: string;
  partyName: string;
  voteCount: number;
  percentage: number;
  color: string;
  imageUrl: string;
}

const results: CandidateResult[] = [
  {
    candidateName: "ANURA KUMARA DISSANAYAKE",
    partyName: "NPP",
    voteCount: 5634915,
    percentage: 42.31,
    color: "#E63946", // Red for NPP
    imageUrl: "assets/images/profile.png",
  },
  {
    candidateName: "SAJITH PREMADASA",
    partyName: "SJB",
    voteCount: 4363035,
    percentage: 32.76,
    color: "#FFD166", // Yellow for SJB
    imageUrl: "assets/images/profile.png",
  },
  {
    candidateName: "RANIL WICKREMESINGHE",
    partyName: "IND16",
    voteCount: 2299767,
    percentage: 17.27,
    color: "#06D6A0", // Green for IND16
    imageUrl: "assets/images/profile.png",
  },
  {
    candidateName: "NAMAL RAJAPAKSA",
    partyName: "SLPP",
    voteCount: 342781,
    percentage: 2.57,
    color: "#D7263D", // Maroon for SLPP
    imageUrl: "assets/images/profile.png",
  },
  {
    candidateName: "ARIYANETHIRAN PAKKIYASELVAM",
    partyName: "IND9",
    voteCount: 226342,
    percentage: 1.7,
    color: "#9E9E9E", // Gray for IND9
    imageUrl: "assets/images/profile.png",
  },
];

const PresidentialElectionResults: React.FC = () => {
  return (
    <div style={{ width: "100%", padding: "20px", background: "#F5F5F5" }}>
      <h3 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        ALL ISLAND RESULTS - FINAL
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" , padding: "20px"}}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "15px",
              background: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              width:"100%"
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
                src={result.imageUrl}
                alt={result.candidateName}
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
                  {result.candidateName}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {result.partyName}
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
                {result.voteCount.toLocaleString()}
              </div>
            </div>

            {/* Percentage Bar */}
            <div
              style={{
                height: "10px",
                background: "#EAEAEA", // Neutral background for the bar
                borderRadius: "4px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${result.percentage}%`, // Dynamic width based on percentage
                  background: result.color, // Color representing the party
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
              {result.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresidentialElectionResults;

// src/data/exampleData.ts
import { CandidateResult } from "@/types/candidateResults"; // Adjust path as necessary

export const results: CandidateResult[] = [
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

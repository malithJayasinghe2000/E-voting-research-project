// /pages/api/map-data.ts
import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import PublishedVotes from "../../../(models)/publishedVotes";
import Candidate from "../../../(models)/Candidate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const votes = await PublishedVotes.find().lean();
    const candidates = await Candidate.find().lean() as CandidateType[];

    // Create a candidateId -> name map
    const candidateMap: Record<string, string> = {};
    candidates.forEach((c) => {
      candidateMap[c._id.toString()] = c.name  || "";
    });

    // Colors per candidate name
    const candidateColors: Record<string, string> = {
        "Anura Kumara": "#FF0000",
        "Sajith Premadasa": "#FFD700",
        "Ranil Wickremesinghe": "#008000",
        "candidate": "#FF0000",
        "new candidate": "#FFD700",
        "test new": "#008000",
      // ... add more names here
    };

    const districtResults: Record<string, { winnerName: string; color: string; votes: number }> = {};

    votes.forEach((doc) => {
      const district = doc.district;
      const voteMap: Record<string, number> = {};
    
      doc.pollingManagers.forEach((pm: any) => {
        pm.votes.forEach((vote: any) => {
          const cid = vote.candidateId;
          voteMap[cid] = (voteMap[cid] || 0) + vote.priority1;
        });
      });
    
      const voteKeys = Object.keys(voteMap);
    
      if (voteKeys.length === 0) {
        // No votes for this district
        districtResults[district] = {
          winnerName: "No Data",
          color: "#999999",
          votes: 0,
        };
        return; // Skip to next district
      }
    
      const winnerId = voteKeys.reduce((a, b) => (voteMap[a] > voteMap[b] ? a : b));
      const winnerName = candidateMap[winnerId] || "Unknown";
    
      districtResults[district] = {
        winnerName,
        color: candidateColors[winnerName] || "#999999",
        votes: voteMap[winnerId],
      };
    });
    

    return res.status(200).json(districtResults);
  } catch (error) {
    console.error("Error generating map data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import PublishedVotes from "../../../(models)/publishedVotes";
import Candidate from "../../../(models)/Candidate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  
  const { district } = req.query;

  if (!district || typeof district !== "string") {
    return res.status(400).json({ message: "District parameter is required" });
  }

  try {
    await connectDB();

    // Fetch all published votes for the district
    const voteResults = await PublishedVotes.find({ district }).lean();

    if (!voteResults.length) {
      return res.status(404).json({ message: "No data found for this district" });
    }

    // Extract all candidateIds across all polling managers and votes
    const candidateIdSet = new Set<string>();

    voteResults.forEach((doc) => {
      doc.pollingManagers.forEach((pm:PollingManager) => {
        pm.votes.forEach((vote) => {
          candidateIdSet.add(vote.candidateId);
        });
      });
    });

    const candidateIds = Array.from(candidateIdSet);

    
    // Fetch candidate details by IDs
    const candidates = await Candidate.find({ _id: { $in: candidateIds } }).lean() as CandidateType[];

    // Create a lookup map for candidate details
    const candidateMap: Record<string, { name: string; party: string ,image:string }> = {};
    candidates.forEach((c) => {
      candidateMap[c._id.toString()] = {
        name: c.name || "",
        party: c.party || "",
        image:c.image || ""
      };
    });

    // Aggregate results
    const totalVotesPerCandidate: Record<string, number> = {};
    let totalVotes = 0;

    voteResults.forEach((doc) => {
      doc.pollingManagers.forEach((pm:PollingManager) => {
        pm.votes.forEach((vote) => {
          totalVotesPerCandidate[vote.candidateId] = (totalVotesPerCandidate[vote.candidateId] || 0) + vote.priority1;
          totalVotes += vote.priority1;
        });
      });
    });

    // Format response
    const overallResults = Object.keys(totalVotesPerCandidate).map((cid) => ({
      candidateId: cid,
      name: candidateMap[cid]?.name || "Unknown",
      party: candidateMap[cid]?.party || "Unknown",
      image: candidateMap[cid]?.image || "Unknown",
      votes: totalVotesPerCandidate[cid],
      percentage: ((totalVotesPerCandidate[cid] / totalVotes) * 100).toFixed(2),
    }));

    // Polling divisions breakdown
    const pollingDivisions = voteResults.map((doc) => {
        const candidateVotes: Record<string, number> = {};
        let divisionTotalVotes = 0;
      
        // Aggregate votes per candidate and total votes for this division
        doc.pollingManagers.forEach((pm: PollingManager) => {
          pm.votes.forEach((vote) => {
            candidateVotes[vote.candidateId] = (candidateVotes[vote.candidateId] || 0) + vote.priority1;
            divisionTotalVotes += vote.priority1;
          });
        });
      
        // Map aggregated results into array format with division-specific percentage
        const candidates = Object.keys(candidateVotes).map((cid) => ({
          candidateId: cid,
          name: candidateMap[cid]?.name || "Unknown",
          party: candidateMap[cid]?.party || "Unknown",
          votes: candidateVotes[cid],
          percentage: divisionTotalVotes > 0 ? ((candidateVotes[cid] / divisionTotalVotes) * 100).toFixed(2) : "0.00",
        }));
      
        return {
          name: doc.local_council,
          candidates,
        };
      });
      

    return res.status(200).json({
      district,
      totalVotes,
      overallResults,
      pollingDivisions,
    });
  } catch (error) {
    console.error("Error fetching district results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

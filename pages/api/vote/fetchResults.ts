import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import PublishedVotes from "../../../(models)/publishedVotes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    
    // Fetch all published votes, including polling managers and votes
    const voteResults = await PublishedVotes.find()
      .populate("plkUserId", "email") // Fetch PLK user email (optional)
      .lean(); // Convert Mongoose document to plain JSON

    return res.status(200).json(voteResults);
  } catch (error) {
    console.error("Error fetching vote results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import publishedVotes from "../../../(models)/publishedVotes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { pollingManagerId, votes } = req.body;

    if (!pollingManagerId || !votes) {
      return res.status(400).json({ message: "Missing polling manager ID or votes" });
    }

    // Store vote results in MongoDB
    await publishedVotes.create({ pollingManagerId, votes });

    return res.status(200).json({ message: "Vote results published successfully!" });
  } catch (error) {
    console.error("Error publishing results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

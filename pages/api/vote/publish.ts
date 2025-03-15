import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import PublishedVotes from "../../../(models)/publishedVotes";
import User from "../../../(models)/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { plkUser, pollingManagers } = req.body;

    if (!plkUser || !Array.isArray(pollingManagers)) {
      return res.status(400).json({ message: "Invalid request, missing PLK user or polling managers" });
    }

    // Find the PLK user
    const plkUserData = await User.findOne({ email: plkUser }).exec();
    if (!plkUserData) {
      return res.status(404).json({ message: "PLK user not found" });
    }

    // Check if an entry already exists for this PLK user
    const existingEntry = await PublishedVotes.findOne({ plkUserId: plkUserData._id }).exec();

    if (existingEntry) {
      // Update existing entry (add new polling managers)
      existingEntry.pollingManagers.push(...pollingManagers);
      await existingEntry.save();
    } else {
      // Create a new entry
      await PublishedVotes.create({
        plkUserId: plkUserData._id,
        pollingManagers,
      });
    }

    return res.status(200).json({ message: "Vote results published successfully!" });
  } catch (error) {
    console.error("Error publishing results:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

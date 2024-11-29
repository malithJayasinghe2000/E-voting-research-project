export const config = {
    runtime:'nodejs',
}

import bodyParser from "body-parser";
import connectDB from "../../../(models)/db";
import Candidate from "../../../(models)/Candidate";
import { getServerSession } from "next-auth"; // Import session management
import { authOptions } from "../auth/[...nextauth]";

const jsonParser = bodyParser.json();

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    jsonParser(req, res, async () => {
        try {
            // Get the current session
            const session = await getServerSession(req, res, authOptions);
            if (!session?.user?.email) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Check if the user has permission to add a candidate
            if (session.user.role !== "admin") {
                return res.status(403).json({ message: "Forbidden: You do not have permission to add a candidate" });
            }

            // Extract candidate data from request body
            const candidateData = req.body;

            console.log("Candidate data:", candidateData);

            // Validate required fields
            const { name, image, party, nationalId, electionId, electionName } = candidateData;
            if (!name || !image || !party || !nationalId || !electionId || !electionName) {
                return res.status(400).json({ message: "All required fields must be provided" });
                
            }

            // Check for duplicate national ID
            const duplicate = await Candidate.findOne({ nationalId }).lean().exec();
            if (duplicate) {
                return res.status(409).json({ message: "Candidate with this National ID already exists" });
            }

            // Create the new candidate
            const newCandidate = await Candidate.create({
                name,
                image,
                party,
                nationalId,
                bio: candidateData.bio || "",
                role: "candidate", // Role is fixed as "candidate"
                electionId,
                electionName,
            });

            return res.status(201).json({ message: "Candidate added successfully", candidate: newCandidate });
        } catch (error) {
            console.error("Error adding candidate:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    });
}

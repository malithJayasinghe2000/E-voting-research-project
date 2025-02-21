export const config = {
    runtime:'nodejs',
}

import bodyParser from "body-parser";
import connectDB from "../../../(models)/db";
import Election from "../../../(models)/Election";
import { getServerSession } from "next-auth";
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

            // Check if the user has permission to add an election
            if (session.user.role !== "admin") {
                return res.status(403).json({ message: "Forbidden: You do not have permission to add an election" });
            }

            // Extract election data from request body
            const electionData = req.body;


            console.log("Election data:", req.body);

            // Validate required fields
            const {  title, description ,startsAt,endsAt} = electionData;
            if ( !title || !description || !startsAt || !endsAt) {
                return res.status(400).json({ message: "All required fields must be provided" });
            }

            // Create the new election
            const newElection = await Election.create({
                title,
                description,
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
            });

            return res.status(201).json({ message: "Election added successfully", newElection });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });
}


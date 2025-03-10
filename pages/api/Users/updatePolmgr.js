export const config = {
    runtime: 'nodejs', // Use Node.js runtime
};

import bodyParser from "body-parser";
import connectDB from "../../../(models)/db";
import User from "../../../(models)/User";
import { getServerSession } from "next-auth"; // Import session management
import { authOptions } from "../auth/[...nextauth]";

const jsonParser = bodyParser.json();

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    jsonParser(req, res, async () => {
        try {
            const session = await getServerSession(req, res, authOptions); // Fetch the current session
            if (!session?.user?.email) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Check if the user is an admin
            if (session.user.role !== "plk") {
                return res.status(403).json({ message: "Forbidden: Only plk can update polling managers" });
            }

            const { userId, updatedData } = req.body;

            // Validate input
            if (!userId || !updatedData) {
                return res.status(400).json({ message: "User ID and updated data are required" });
            }

            // Find the user to update
            const userToUpdate = await User.findById(userId).exec();
            if (!userToUpdate) {
                return res.status(404).json({ message: "User not found" });
            }

            // Ensure the user being updated is a PLK
            if (userToUpdate.role !== "polling_manager") {
                return res.status(403).json({ message: "Forbidden: Only polling managers users can be updated" });
            }

            // Update fields (including the status field)
            const allowedUpdates = ["name", "email", "status"]; // Add `status` to the list
            for (const key in updatedData) {
                if (allowedUpdates.includes(key)) {
                    userToUpdate[key] = updatedData[key];
                }
            }

            // Save the updated user
            await userToUpdate.save();

            return res.status(200).json({ message: "User updated successfully", user: userToUpdate });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    });
}

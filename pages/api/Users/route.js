export const config = {
    runtime: 'nodejs', // Use Node.js runtime
};

import bodyParser from "body-parser";
import connectDB from "../../../(models)/db";
import User from "../../../(models)/User";
import bcrypt from "bcryptjs";
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
            const session = await getServerSession(req, res, authOptions); // Fetch the current session
            if (!session?.user?.email) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            let loggedInUser = null; 

            if(session.user.role === "plk"){
            loggedInUser = await User.findOne({ email: session.user.email }).exec();
            if (!loggedInUser) {
                return res.status(401).json({ message: "Logged-in user not found" });
            }
        }
            const userData = req.body.formData;
            

            // Validate input
            if (!userData.email || !userData.password) {
                return res.status(400).json({ message: "Please enter all fields" });
            }

            // Check if email already exists
            const duplicate = await User.findOne({ email: userData.email }).lean().exec();
            if (duplicate) {
                return res.status(409).json({ message: "Email already exists" });
            }

            // Hash the password
            const hashPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashPassword;

            // Admin creating `plk`
            if (session.user.role === "admin" && userData.role === "plk") {
                // No additional actions required for `admin` creating `plk`
            }


            else if (session.user.role === "plk" && userData.role === "polling_manager") {
                userData.addedBy = loggedInUser._id;

                
                
            }
            // PLK creating `gsw`
            else if (session.user.role === "plk" && userData.role === "gsw") {
                // Set the `addedBy` field for the new GSW user
                userData.addedBy = loggedInUser._id;

                // Create the new GSW user
                const newGswUser = await User.create(userData);

                // Update the PLK user's `gsws` array
                loggedInUser.gsws = loggedInUser.gsws || []; // Initialize if undefined
                loggedInUser.gsws.push(newGswUser._id);
                await loggedInUser.save();

                return res.status(201).json({ message: "GSW user created successfully" });
            } else {
                return res.status(403).json({ message: "Forbidden: Role mismatch or invalid role" });
            }

            // Create the user (PLK creation path)
            await User.create(userData);
            return res.status(201).json({ message: "User created successfully" });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    });
}
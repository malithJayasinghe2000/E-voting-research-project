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

    // Use the middleware to parse JSON body
    jsonParser(req, res, async () => {
        try {
            const session = await getServerSession(req, res, authOptions); // Fetch the current session
            if (!session?.user?.email) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            if(session.user.role === "plk" ){
            const loggedInUser = await User.findOne({ email: session.user.email }).lean().exec();
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

            if(session.user.role === "plk"){
                userData.addedBy = loggedInUser._id;

            }
            

            // Create the user
            await User.create(userData);

            return res.status(201).json({ message: "User created" });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    });
}

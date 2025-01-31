
import connectDB from "../../../(models)/db";
import Party from "../../../(models)/Party";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default bodyParser
    },
    };

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        // Get the current session
        const session = await getServerSession(req, res, authOptions);
        

       

        // Get all parties
        const parties = await Party.find();

        return res.status(200).json({ parties });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
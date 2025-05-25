// get candidate by id controller
import connectDB from "../../../(models)/db";
import Candidate from "../../../(models)/Candidate";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    await connectDB();

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { id } = req.query;

        // Uncomment if you want to add session validation
        // const session = await getServerSession(req, res, authOptions);
        // if (!session?.user?.email) {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }

        // if (session.user.role !== "admin") {
        //     return res.status(403).json({ message: "Forbidden" });
        // }

        if (!id) {
            return res.status(400).json({ message: "Candidate ID is required" });
        }

        const candidate = await Candidate.findById(id);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        return res.status(200).json({ candidate });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

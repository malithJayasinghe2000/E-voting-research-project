import connectDB from "../../../(models)/db";
import Candidate from "../../../(models)/Candidate";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async (req, res) => {
    const session = await getServerSession(req, res, authOptions); // Fix here
    if (session) {
        const { method } = req;
        await connectDB();
        switch (method) {
            case "PUT":
                try {
                    
                    const candidate = await Candidate.findByIdAndUpdate(
                        req.body.id,
                        req.body,
                        {
                            new: true,
                            runValidators: true,
                        }
                    );
                    if (!candidate) {
                        return res.status(400).json({ success: false });
                    }
                    res.status(200).json({ success: true, data: candidate });
                } catch (error) {
                    res.status(400).json({ success: false, error: error.message });
                }
                break;
            default:
                res.status(400).json({ success: false, message: "Invalid method" });
                break;
        }
    } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

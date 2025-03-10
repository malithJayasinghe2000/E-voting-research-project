import connectDB from "../../../(models)/db";
import User from "../../../(models)/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions); // Fetch the current session

    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if the logged-in user is allowed to fetch PLK users (e.g., an admin)
    if (session.user.role !== "plk") {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    // Fetch all users with the role "plk"
    const plkUsers = await User.find({ role: "gsw" }).select("-password").lean();

    return res.status(200).json({  plkUsers });
  } catch (error) {
    console.error("Error fetching GSW users:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

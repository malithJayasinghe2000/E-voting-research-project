import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../(models)/db";
import User from "../../../(models)/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    // Fetch all users with role 'plk'
    const plkUsers = await User.find({ role: "plk" }).lean().exec();

    // Group polling managers by 'plk' and include plk user details
    const groupedPollingManagers = await Promise.all(
      plkUsers.map(async (plkUser) => {
        const pollingManagers = await User.find({ addedBy: plkUser._id, role: "polling_manager" }).lean().exec();
        
        // Include district and local_council in the response
        return {
          plkUser: plkUser.email,
          plkUserDetails: {
            district: plkUser.district || null,
            local_council: plkUser.local_council || null,
          },
          pollingManagers,
        };
      })
    );

    return res.status(200).json(groupedPollingManagers);
  } catch (error) {
    console.error("Error fetching polling managers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

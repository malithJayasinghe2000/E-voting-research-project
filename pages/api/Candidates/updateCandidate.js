import connectDB from "../../../(models)/db";
import Candidate from "../../../(models)/Candidate";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: You do not have permission to update a candidate" });
    }

    const { id, name, no, party, nationalId, slogan, profileImage, bio, socialLinks, education, experience } = req.body;

    // Validate required fields
    if (!id || !name || !no || !party || !nationalId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Parse JSON fields
    const parsedBio = bio ? JSON.parse(bio) : {};
    const parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};
    const parsedEducation = education ? JSON.parse(education) : [];
    const parsedExperience = experience ? JSON.parse(experience) : [];

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      {
        name,
        no,
        party,
        nationalId,
        slogan: slogan || "",
        profileImage: profileImage || "",
        bio: parsedBio,
        socialLinks: parsedSocialLinks,
        education: parsedEducation,
        experience: parsedExperience,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    return res.status(200).json({ message: "Candidate updated successfully", candidate: updatedCandidate });
  } catch (error) {
    console.error("Error updating candidate:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

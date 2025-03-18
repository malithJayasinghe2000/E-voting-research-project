import multer from "multer";
import path from "path";
import connectDB from "../../../(models)/db";
import Candidate from "../../../(models)/Candidate";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + file.originalname;
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 }
]);

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's default bodyParser
  },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      // Get the current session
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if the user has permission to add a candidate
      if (session.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: You do not have permission to add a candidate" });
      }

      // Parse the form data
      const candidateData = req.body;
      const imagePath = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
      const profileImagePath = req.files.profileImage ? `/uploads/${req.files.profileImage[0].filename}` : imagePath;

      // Validate required fields
      const { name, no, party, nationalId, electionId } = candidateData;
      if (!name || !no || !imagePath || !party || !nationalId || !electionId) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      // Check for duplicate national ID
      const duplicate = await Candidate.findOne({ nationalId }).lean().exec();
      if (duplicate) {
        return res.status(409).json({ message: "Candidate with this National ID already exists" });
      }

      // Parse JSON fields if they are strings
      let education = [];
      let experience = [];
      let socialLinks = { linkedin: "", github: "", twitter: "", whatsapp: "" };
      let bio = { 
        description: candidateData.bio || "",
        dob: "",
        nationality: "",
        religion: "",
        maritalStatus: "",
        netWorth: ""
      };

      if (candidateData.education) {
        try {
          education = typeof candidateData.education === 'string' 
            ? JSON.parse(candidateData.education) 
            : candidateData.education;
        } catch (e) {
          education = [candidateData.education];
        }
      }

      if (candidateData.experience) {
        try {
          experience = typeof candidateData.experience === 'string' 
            ? JSON.parse(candidateData.experience) 
            : candidateData.experience;
        } catch (e) {
          experience = [candidateData.experience];
        }
      }

      if (candidateData.socialLinks) {
        try {
          socialLinks = typeof candidateData.socialLinks === 'string' 
            ? JSON.parse(candidateData.socialLinks) 
            : candidateData.socialLinks;
        } catch (e) {
          // Keep default empty social links
        }
      }

      if (candidateData.bio) {
        try {
          if (typeof candidateData.bio === 'string') {
            const parsedBio = JSON.parse(candidateData.bio);
            bio = {
              description: parsedBio.description || candidateData.bio,
              dob: parsedBio.dob || "",
              nationality: parsedBio.nationality || "",
              religion: parsedBio.religion || "",
              maritalStatus: parsedBio.maritalStatus || "",
              netWorth: parsedBio.netWorth || ""
            };
          } else {
            bio = {
              ...bio,
              ...candidateData.bio
            };
          }
        } catch (e) {
          bio.description = candidateData.bio;
        }
      }

      // Create the new candidate
      const newCandidate = await Candidate.create({
        name,
        no,
        image: imagePath,
        profileImage: profileImagePath,
        party,
        nationalId,
        slogan: candidateData.slogan || "",
        bio,
        socialLinks,
        education,
        experience,
        role: "candidate",
        electionId,
      });

      return res.status(201).json({ message: "Candidate added successfully", candidate: newCandidate });
    } catch (error) {
      console.error("Error adding candidate:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
}

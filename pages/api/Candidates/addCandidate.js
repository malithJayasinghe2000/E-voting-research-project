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
}).single("image");

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
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      // Validate required fields
      const { bio, name,no, party, nationalId, electionId } = candidateData;
      if (!bio || !name || !no || !imagePath || !party || !nationalId || !electionId) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      // Check for duplicate national ID
      const duplicate = await Candidate.findOne({ nationalId }).lean().exec();
      if (duplicate) {
        return res.status(409).json({ message: "Candidate with this National ID already exists" });
      }

      // Create the new candidate
      const newCandidate = await Candidate.create({
        name,
        no,
        image: imagePath,
        party,
        nationalId,
        bio,
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

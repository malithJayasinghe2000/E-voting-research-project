import multer from "multer";
import path from "path";
import connectDB from "../../../(models)/db";
import Party from "../../../(models)/Party";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/parties",
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
}).single("logo");

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
      const patyData = req.body;
      const imagePath = req.file ? `/uploads/parties/${req.file.filename}` : null;

      // Validate required fields
      const { short_name, full_name, description } = req.body;
      const logo = req.file ? `/uploads/parties/${req.file.filename}` : null;

      // Validate required fields
      if (!short_name || !full_name || !description || !logo) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      // Check for duplicate national ID
      const duplicate = await Party.findOne({ short_name }).lean().exec();
      if (duplicate) {
        return res.status(409).json({ message: "Party with this name already exists" });
      }

      // Create the new candidate
      const newParty = await Party.create({
        short_name,
        full_name,
        logo: imagePath,
        description,
      });

      return res.status(201).json({ message: "Party added successfully", party: newParty });
    } catch (error) {
      console.error("Error adding Party:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
}

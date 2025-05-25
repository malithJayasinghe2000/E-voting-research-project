import connectDB from '../../../(models)/db';
import Candidate from '../../../(models)/Candidate';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const candidates = await Candidate.find().select("name party");
      res.status(200).json({ candidates });
    } catch (error) {
      console.error("Candidate Fetch Error:", error);
      res.status(500).json({ message: "Error fetching candidates", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

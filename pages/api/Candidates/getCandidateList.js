export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Include party in the select clause
      const candidates = await Candidate.find().select("name party");
      res.status(200).json({ 
        candidates: candidates.map(c => ({
          name: c.name,
          party: c.party
        })) 
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching candidates" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
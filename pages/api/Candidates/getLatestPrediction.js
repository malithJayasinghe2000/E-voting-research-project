import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Load Firebase credentials
const serviceAccountPath = path.join(process.cwd(), "pages/api/Candidates/firebase-credentials.json");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const predictionsRef = db.collection("monthly_predictions");

      // Fetch the latest month
      const snapshot = await predictionsRef.orderBy("month").limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ success: false, message: "No election results found" });
      }

      const latestMonthDoc = snapshot.docs[0];
      const latestMonth = latestMonthDoc.data().month;

      console.log("Latest month:", latestMonth);

      // Fetch all candidates for that month
      const latestSnapshot = await predictionsRef
        .where("month", "==", latestMonth)
        .get();

      if (latestSnapshot.empty) {
        return res.status(404).json({ success: false, message: "No candidates found for the latest month" });
      }

      const results = latestSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          candidateName: data.candidate || "Unknown Candidate",
          partyName: data.party || "Unknown Party",
          voteCount: Math.round(data.predicted_vote_share) || 0,
          percentage: parseFloat(data.predicted_vote_share?.toFixed(2)) || 0,
          color: getCandidateColor(data.candidate),
          imageUrl: data.imageUrl || "/default-candidate.png",
        };
      });

      console.log("Results:", results);

      res.status(200).json({ success: true, results });
    } catch (error) {
      console.error("Firebase fetch error:", error);
      res.status(500).json({ success: false, message: "Error fetching election results", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

const getCandidateColor = (candidate) => {
  const candidateColors = {
    "Ranil Wickramasinghe": "#FF5733",
    "Anura Kumara Dissanayake": "#33A1FF",
    "Sajith Premadasa": "#28A745",
    "Namal Rajapakse": "#FFC300",
  };
  return candidateColors[candidate] || generateRandomColor();
};

const generateRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

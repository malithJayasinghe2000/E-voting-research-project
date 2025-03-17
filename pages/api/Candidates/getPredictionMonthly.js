import admin from "firebase-admin";
import path from "path";
import fs from "fs";

// ✅ Initialize Firebase Admin (only once)
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"))),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("monthly_predictions").get();
    const predictions = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // 🔹 Convert Firestore Timestamp to "YYYY-MM" format
      const monthTimestamp = data.month;
      let monthStr = "";
      if (monthTimestamp && monthTimestamp._seconds) {
        const date = new Date(monthTimestamp._seconds * 1000); // Convert to JavaScript Date
        monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      const candidate = data.candidate;
      const predictedVotes = data.predicted_vote_share;

      if (!predictions[monthStr]) {
        predictions[monthStr] = { month: monthStr };
      }
      predictions[monthStr][candidate] = predictedVotes;
    });

    const sortedData = Object.values(predictions).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    return res.status(200).json(sortedData);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return res.status(500).json({ error: "Failed to fetch predictions" });
  }
}

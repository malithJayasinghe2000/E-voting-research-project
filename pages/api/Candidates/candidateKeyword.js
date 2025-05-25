import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Load Firebase credentials
const serviceAccountPath = path.join(process.cwd(), "pages/api/Candidates/firebase-credentials.json");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: serviceAccount.databaseURL || process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Get data directly from request body
      const { name, keywords } = req.body;

      // Validate input
      if (!name || !Array.isArray(keywords)) {
        return res.status(400).json({ 
          message: "Invalid request format. Requires 'name' (string) and 'keywords' (array)" 
        });
      }

      // Save to Firestore
      await db.collection("candidates").doc(name).set({
        name: name,
        keywords: keywords,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      res.status(200).json({ 
        success: true,
        message: "Keywords saved successfully",
        data: { name, keywords }
      });
      
    } catch (error) {
      console.error("Firebase save error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error saving keywords",
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
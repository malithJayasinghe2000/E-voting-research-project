import { IncomingForm } from "formidable"
import fs from "fs"
import fetch from "node-fetch"
import FormData from "form-data"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to parse form data" })
    }

    if (!files.image) {
      return res.status(400).json({ error: "No image uploaded" })
    }

    const imageFile = files.image[0] // Access the first file in the array

    const formData = new FormData()
    formData.append("image", fs.createReadStream(imageFile.filepath), {
      filename: imageFile.originalFilename,
      contentType: imageFile.mimetype,
    })

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      })

      const data = await response.json()
      console.log("Prediction Data:", data); // Display prediction in console

      // Combine consecutive predictions to form multi-digit numbers
      const predictedNumber = data.predictions.map(prediction => prediction.digit).join('');
      console.log("Combined Predicted Number:", predictedNumber);

      // Fetch candidate list
      const candidatesResponse = await fetch("http://localhost:3000/api/Candidates/getCandidates");
      const candidatesData = await candidatesResponse.json();
      const candidates = candidatesData.candidates;

      // Check if predicted number is in candidate list
      const candidate = candidates.find(candidate => candidate.no === predictedNumber);

      if (candidate) {
        console.log(`Predicted Number: ${predictedNumber}, Candidate Name: ${candidate.name}`);
        return res.status(200).json({ predictedNumber, candidateName: candidate.name });
      } else {
        console.log(`Predicted Number: ${predictedNumber}`);
        return res.status(200).json({ predictedNumber });
      }
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Failed to fetch predictions" })
    }
  })
}


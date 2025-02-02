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
      return res.status(200).json(data)
    } catch (error) {
      console.error("Error:", error)
      return res.status(500).json({ error: "Failed to fetch predictions" })
    }
  })
}


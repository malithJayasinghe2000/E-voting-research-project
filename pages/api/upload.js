import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: true });
  let fields;
  let files;

  try {
    [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log('files:', files);

    const imageFile = files.file[0];
    console.log('imageFile:', imageFile);

    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Create the upload directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const newFileName = `${uniqueSuffix}-${imageFile.originalFilename}`;
    const newFilePath = path.join(uploadDir, newFileName);

    // Copy the file to the target directory and then remove the temporary file
    await fs.copyFile(imageFile.filepath, newFilePath);
    await fs.unlink(imageFile.filepath);

    console.log('uploaded image:', newFilePath);

    return res.status(200).json({ message: "File uploaded", url: `/uploads/${newFileName}` });
} catch (error) {
    console.error('upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
}
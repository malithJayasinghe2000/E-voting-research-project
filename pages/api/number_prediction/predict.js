import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import nextConnect from 'next-connect';

const upload = multer({ dest: '/tmp' });

const handler = nextConnect()
  .use(upload.single('image'))
  .post(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(req.file.path));

      const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      res.json(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: 'Failed to get prediction' });
    } finally {
      fs.unlinkSync(req.file.path);
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

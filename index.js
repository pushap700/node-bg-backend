import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import cors from 'cors';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// ✅ Python backend का URL — Railway deploy के बाद यहाँ डालें
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'https://web-production-a7ef.up.railway.app';

app.get('/', (req, res) => {
  res.json({ status: 'Node BG Remove Backend Running ✅' });
});

app.post('/remove-bg', upload.single('image'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));

    const pyRes = await fetch(`${PYTHON_BACKEND_URL}/remove-bg`, {
      method: 'POST',
      body: form,
    });

    if (!pyRes.ok) {
      return res.status(500).json({ success: false, error: 'Python backend error' });
    }

    const buffer = await pyRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // temp file cleanup
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      image: `data:image/png;base64,${base64}`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Node backend running on port ${PORT}`);
});

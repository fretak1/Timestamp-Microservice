require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // files saved in 'uploads' folder

app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API endpoint to upload a file and return metadata
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  console.log('File received:', req.file);
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, mimetype, size } = req.file;

  res.json({
    name: originalname,
    type: mimetype,
    size: size
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

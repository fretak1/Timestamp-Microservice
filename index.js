require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory database
let urlDatabase = [];
let idCounter = 1;

// ✅ POST a URL to shorten
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      // Check if the URL already exists
      const existing = urlDatabase.find(entry => entry.original_url === originalUrl);
      if (existing) {
        return res.json({
          original_url: existing.original_url,
          short_url: existing.short_url
        });
      }

      // Store new URL
      const newEntry = {
        original_url: originalUrl,
        short_url: idCounter++
      };
      urlDatabase.push(newEntry);

      res.json({
        original_url: newEntry.original_url,
        short_url: newEntry.short_url
      });
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// ✅ GET redirect from short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.status(404).json({ error: 'No short URL found' });
  }
});

// ✅ Start server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

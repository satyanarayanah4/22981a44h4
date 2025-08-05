const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const crypto = require('crypto');

function generateShortcode(length = 6) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

router.post('/shorturls', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  const code = shortcode || generateShortcode();

  try {
    const exists = await Url.findOne({ shortcode: code });
    if (exists) return res.status(409).json({ error: "Shortcode already exists" });

    const expiryDate = new Date(Date.now() + validity * 60 * 1000);

    const newUrl = new Url({
      shortcode: code,
      originalUrl: url,
      expiresAt: expiryDate
    });

    await newUrl.save();

    res.status(201).json({
      shortLink: `http://localhost:3000/${code}`,
      expiry: expiryDate.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortcode });

    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });

    const stats = {
      originalUrl: urlDoc.originalUrl,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expiresAt,
      totalClicks: urlDoc.clicks.length,
      clickDetails: urlDoc.clicks.map(c => ({
        timestamp: c.timestamp,
        referrer: c.referrer,
        location: c.location
      }))
    };

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortcode });

    if (!urlDoc) return res.status(404).json({ error: "Shortcode not found" });
    if (urlDoc.expiresAt < new Date()) return res.status(410).json({ error: "Link expired" });
    urlDoc.clicks.push({
      referrer: req.get('Referrer') || 'Direct',
      location: req.ip 
    });
    await urlDoc.save();
    res.redirect(urlDoc.originalUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

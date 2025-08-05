const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: String,
  location: String
});

const urlSchema = new mongoose.Schema({
  shortcode: { type: String, unique: true },
  originalUrl: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  clicks: [clickSchema]
});

module.exports = mongoose.model('Url', urlSchema);

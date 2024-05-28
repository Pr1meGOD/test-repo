const mongoose = require('mongoose');

const newsWebsiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  lastFetched: { type: Date, default: Date.now },
});

const NewsWebsite = mongoose.model('NewsWebsite', newsWebsiteSchema);

module.exports = NewsWebsite;

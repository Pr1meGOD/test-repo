const express = require('express');
const mongoose = require('mongoose');
const NewsWebsite = require('./newsWebsite_test'); // Import the NewsWebsite model

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));

// Endpoint to add a news website
app.post('/add-news-website', async (req, res) => {
  try {
    const { name, url } = req.body;
    const newsWebsite = new NewsWebsite({ name, url });
    await newsWebsite.save();
    res.status(201).send('News website added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to get news headlines from a specific website
app.get('/news-headlines/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const newsWebsite = await NewsWebsite.findOne({ name });
    if (!newsWebsite) {
      return res.status(404).send('News website not found');
    }

    // Placeholder for fetchAndAnalyzeNews function
    const headlines = await fetchAndAnalyzeNews(newsWebsite.url);

    res.status(200).json(headlines);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Example placeholder function for fetching and analyzing news
async function fetchAndAnalyzeNews(url) {
  // Fetch news headlines from the specified URL (this is a placeholder, adapt as needed)
  // Replace with actual logic to fetch and analyze news
  const headlines = [{ headline: "Sample headline", sentiment: { score: 1 } }];
  return headlines;
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// API key for NewsAPI
const apiKey = 'e43b1ad8b17d40d8bb3ea4fbda65c06e'; // Replace with your NewsAPI key

// Function to fetch top news headlines from Times of India
async function fetchHeadlines() {
    try {
        const mainUrl = 'https://newsapi.org/v2/top-headlines';
        const query_params = {
            sources: 'the-times-of-india',
            pageSize: 10,
            apiKey: apiKey
        };

        // Fetching data from NewsAPI
        const response = await axios.get(mainUrl, { params: query_params });
        const articles = response.data.articles;

        // Extracting titles of articles
        const headlines = articles.map(article => article.title);

        return headlines;
    } catch (error) {
        console.error('Error fetching headlines:', error.message);
        throw error;
    }
}

// API endpoint to fetch top 10 news headlines from Times of India
app.get('/news', async (req, res) => {
    try {
        const headlines = await fetchHeadlines();

        // Sending the headlines as JSON response
        res.json(headlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error.message);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});










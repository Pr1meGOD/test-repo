import express from 'express';
import axios from 'axios';
import Parser from 'rss-parser';

const app = express();
const port = 3000;
const parser = new Parser();

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from Hindustan Times RSS feed
app.get('/news', async (req, res) => {
    try {
        // Fetch the RSS feed
        const feedUrl = 'https://www.hindustantimes.com/rss';
        const feed = await parser.parseURL(feedUrl);

        // Log feed for debugging
        console.log('Fetched feed:', feed);

        // Extract the top 10 articles
        const articles = feed.items.slice(0, 10);

        // Log articles for debugging
        console.log('Extracted articles:', articles);

        const newsHeadlines = await Promise.all(articles.map(async article => {
            const title = article.title;
            const link = article.link;
            const sentiment = await getSentiment(title);
            return { title, link, sentiment };
        }));

        res.json(newsHeadlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error.message);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis
async function getSentiment(title) {
    try {
        const sentimentAPI = 'https://c6a7zwwwyj.execute-api.us-east-1.amazonaws.com/devv';
        const response = await axios.post(sentimentAPI, { text: title });
        const sentiment = response.data.sentiment;
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error.message);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});




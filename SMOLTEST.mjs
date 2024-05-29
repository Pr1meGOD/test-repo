import express from 'express';
import axios from 'axios';
import xml2js from 'xml2js';

const app = express();
const port = 3000;

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
        const feedUrl = 'https://www.hindustantimes.com/rss';
        const response = await axios.get(feedUrl, { responseType: 'text' });
        const feedData = response.data;

        // Parse the RSS feed using xml2js
        xml2js.parseString(feedData, { trim: true, explicitArray: false }, async (err, result) => {
            if (err) {
                throw new Error(`Failed to parse RSS feed: ${err.message}`);
            }

            // Extract articles from the parsed feed
            const articles = result.rss.channel.item.slice(0, 10); // Get the top 10 articles

            const newsHeadlines = await Promise.all(articles.map(async article => {
                const title = article.title;
                const link = article.link;
                const sentiment = await getSentiment(title);
                return { title, link, sentiment };
            }));

            res.json(newsHeadlines);
        });
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





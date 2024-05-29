import express from 'express';
import axios from 'axios';
import Parser from 'rss-parser';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from Times of India RSS feed
app.get('/news', async (req, res) => {
    try {
        const feedUrl = 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms';
        const parser = new Parser();
        const feed = await parser.parseURL(feedUrl);

        if (feed.items && feed.items.length > 0) {
            const articles = feed.items.slice(0, 10); // Limit to top 10 articles
            const newsHeadlines = await Promise.all(articles.map(async article => {
                const title = article.title;
                const link = article.link;
                const sentiment = await getSentiment(title);
                return { title, link, sentiment };
            }));
            res.json(newsHeadlines);
        } else {
            throw new Error('Failed to fetch news headlines from Times of India RSS feed');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis (dummy function for example)
async function getSentiment(title) {
    try {
        // Replace with your actual sentiment analysis API endpoint or logic
        // For example, using Axios to make a POST request to your sentiment analysis service
        const sentimentAPI = 'https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev';
        const response = await axios.post(sentimentAPI, { text: title });
        const sentiment = response.data.sentiment;
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});


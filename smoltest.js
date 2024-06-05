import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const apiKey = 'pub_4568352b5e63671c676e20c29210bf5a47d71';
        const response = await fetch(`https://newsdata.io/api/1/news?apikey=pub_4568352b5e63671c676e20c29210bf5a47d71&q=https://www.thehindu.com/`);
        const data = await response.json();

        if (data.status === 'success') {
            const articles = data.results.slice(0, 10); // Get top 10 articles
            const newsHeadlines = await Promise.all(articles.map(async article => {
                const title = article.title;
                const link = article.link;
                const sentiment = await getSentiment(title);
                return { title, link, sentiment };
            }));
            res.json(newsHeadlines);
        } else {
            throw new Error('Failed to fetch news headlines');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis
async function getSentiment(title) {
    try {
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
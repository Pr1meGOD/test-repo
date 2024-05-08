import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', '*'); // Allow only GET requests
    res.setHeader('Access-Control-Allow-Headers', '*'); // Allow only Content-Type header
    next();
});

// API endpoint to fetch news headlines from BBC and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const apiKey = '8299ddae71074acd8232edcfef9b7fb8'; // Your News API key
        const response = await fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok') {
            const articles = data.articles;
            const newsHeadlines = articles.map(async article => {
                const title = article.title;
                const link = article.url;
                const sentiment = await getSentiment(title); // Call async function to get sentiment
                return { title, link, sentiment };
            });
            Promise.all(newsHeadlines).then(results => {
                res.json(results);
            });
        } else {
            throw new Error('Failed to fetch news headlines from BBC');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis (dummy function for demonstration)
async function getSentiment(title) {
    try {
        const sentimentAPI = 'https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev'; // Sentiment analysis API endpoint
        const response = await axios.post(sentimentAPI, { text: title });
        const sentiment = response.data.sentiment;
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A'; // Return 'N/A' if sentiment analysis fails
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

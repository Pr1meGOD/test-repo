import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow only GET requests
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow only Content-Type header
    next();
});

// API endpoint to fetch news headlines from BBC and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const apiKey = '8299ddae71074acd8232edcfef9b7fb8'; 
        const response = await fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok') {
            const articles = data.articles;
            const newsHeadlines = await Promise.all(articles.map(async article => {
                const sentimentResponse = await axios.post('https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev', {
                    text: article.title // Use the article title as the input for sentiment analysis
                });
                const sentiment = sentimentResponse.data.sentiment; // Assuming the sentiment analysis API returns the sentiment in the response
                return {
                    title: article.title,
                    link: article.url,
                    sentiment: sentiment // Add sentiment to the news headline object
                };
            }));
            res.json(newsHeadlines);
        } else {
            throw new Error('Failed to fetch news headlines from BBC');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

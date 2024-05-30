import express from 'express';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
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

// API endpoint to fetch news headlines from Hindustan Times India RSS feed
app.get('/ht-india-news', async (req, res) => {
    try {
        const rssFeedUrl = 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml';
        const response = await fetch(rssFeedUrl);
        const xmlData = await response.text();

        // Parse XML to JSON
        const parsedData = await parseStringPromise(xmlData);
        const items = parsedData.rss.channel[0].item;

        // Extracting the top 10 headlines
        const newsHeadlines = items.slice(0, 10).map((item, index) => ({
            title: item.title[0],
            link: item.link[0],
            sentiment: 'N/A' // Placeholder for sentiment analysis, replace as needed
        }));

        // Fetching sentiment for each headline asynchronously
        const newsWithSentiment = await Promise.all(newsHeadlines.map(async (headline) => {
            try {
                const sentimentAPI = 'https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev';
                const response = await axios.post(sentimentAPI, { text: headline.title });
                const sentiment = response.data.sentiment;
                headline.sentiment = sentiment;
            } catch (error) {
                console.error('Error fetching sentiment:', error);
            }
            return headline;
        }));

        res.json(newsWithSentiment); // Sending the array of headlines with sentiment as JSON response
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});







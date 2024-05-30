const express = require('express');
const fetch = require('node-fetch');
const { parseStringPromise } = require('xml2js');
const axios = require('axios');

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
        const newsHeadlines = await Promise.all(items.slice(0, 10).map(async (item, index) => {
            const title = item.title[0];
            const link = item.link[0];
            const sentiment = await getSentiment(title);
            return { title, link, number: index + 1, sentiment };
        }));

        res.json(newsHeadlines); // Sending the array of headlines as JSON response
    } catch (error) {
        console.error('Error fetching news headlines:', error);
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
        console.error('Error fetching sentiment:', error);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});








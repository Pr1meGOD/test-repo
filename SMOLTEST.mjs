import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from Hindustan Times Mumbai RSS feed
app.get('/ht-mumbai-news', async (req, res) => {
    try {
        const rssUrl = 'https://www.hindustantimes.com/feeds/rss/cities/mumbai-news/rssfeed.xml';
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
        }
        const rssText = await response.text();

        const rssData = await parseStringPromise(rssText, {
            trim: true,
            normalizeTags: true,
            explicitArray: false,
            mergeAttrs: true,
        });

        if (rssData.rss && rssData.rss.channel && rssData.rss.channel.item) {
            const articles = Array.isArray(rssData.rss.channel.item) ? rssData.rss.channel.item.slice(0, 10) : [rssData.rss.channel.item];
            const newsHeadlines = await Promise.all(
                articles.map(async (article, index) => {
                    const title = article.title;
                    const link = article.link;
                    const sentiment = await getSentiment(title);
                    return { title: `${index + 1}. ${title}`, link, sentiment };
                })
            );
            res.json(newsHeadlines);
        } else {
            throw new Error('No news articles found in the RSS feed');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error.message);
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
        console.error('Error fetching sentiment:', error.message);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});













import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { parseString } from 'xml2js';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// Function to fetch headlines from RSS feed
async function fetchHeadlines(feedUrl) {
    try {
        const response = await axios.get(feedUrl);
        const xmlData = response.data;

        let headlines = [];

        // Parse XML data
        parseString(xmlData, { trim: true }, (err, result) => {
            if (err) {
                throw new Error(`Failed to parse RSS feed: ${err.message}`);
            }
            const items = result.rss.channel[0].item;
            headlines = items.map(item => item.title[0]);
        });

        return headlines;
    } catch (error) {
        console.error('Error fetching headlines:', error.message);
        throw error;
    }
}

// API endpoint to fetch news headlines from multiple RSS feeds
app.get('/news', async (req, res) => {
    try {
        const feedUrls = [
            'https://www.hindustantimes.com/feeds/rss/brand-stories/international/rssfeed.xml',
            'https://www.hindustantimes.com/feeds/rss/analysis/rssfeed.xml',
            'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml'
        ];

        // Fetch headlines from all feeds asynchronously
        const promises = feedUrls.map(url => fetchHeadlines(url));
        const results = await Promise.all(promises);

        // Flatten the array of arrays into a single array of headlines
        const headlines = results.flat();

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







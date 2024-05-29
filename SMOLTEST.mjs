import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// Function to fetch and parse XML from Times of India RSS feed
async function fetchHeadlines() {
    try {
        const url = 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms';
        const response = await axios.get(url);
        const xml = response.data;

        // Parsing XML to JSON
        let headlines = [];
        parseString(xml, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                throw err;
            }
            headlines = result.rss.channel[0].item.slice(0, 10).map(item => ({
                title: item.title[0],
                link: item.link[0]
            }));
        });

        return headlines;
    } catch (error) {
        console.error('Error fetching headlines:', error.message);
        throw error;
    }
}

// API endpoint to fetch top 10 news headlines from Times of India RSS feed
app.get('/news', async (req, res) => {
    try {
        const headlines = await fetchHeadlines();
        res.json(headlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error.message);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});












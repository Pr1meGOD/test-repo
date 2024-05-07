const express = require('express');
const fetch = require('node-fetch'); // Install node-fetch: npm install node-fetch

const app = express();
const port = 3000;

// API endpoint to fetch news headlines
app.get('/news', async (req, res) => {
    try {
        const response = await fetch('https://www.hindustantimes.com/rss/topnews/rssfeed.xml');
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        const items = xml.querySelectorAll('item');
        
        const newsHeadlines = [];
        items.forEach(item => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            newsHeadlines.push({ title, link });
        });
        
        res.json(newsHeadlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

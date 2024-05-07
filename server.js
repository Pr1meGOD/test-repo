import('node-fetch').then(async ({ default: fetch }) => {
    const express = require('express');
    const { DOMParser } = require('xmldom');

    const app = express();
    const port = 3000;

    // Middleware to enable CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', '*'); // Allow GET, POST, OPTIONS requests
        res.setHeader('Access-Control-Allow-Headers', '*'); // Allow Content-Type header
        next();
    });

    // API endpoint to fetch news headlines
    app.get('/news', async (req, res) => {
        try {
            const response = await fetch('https://www.hindustantimes.com/rss/topnews/rssfeed.xml');
            const data = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');

            const items = xml.getElementsByTagName('item'); // Use getElementsByTagName instead of querySelectorAll

            const newsHeadlines = [];
            for (let i = 0; i < items.length; i++) {
                const title = items[i].querySelector('title').textContent;
                const link = items[i].querySelector('link').textContent;
                newsHeadlines.push({ title, link });
            }

            res.setHeader('Content-Type', 'application/json'); // Set response Content-Type header
            res.json(newsHeadlines);
        } catch (error) {
            console.error('Error fetching news headlines:', error);
            res.status(500).json({ error: 'Failed to fetch news headlines' });
        }
    });

    app.listen(port, () => {
        console.log(`Backend server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Error importing node-fetch:', error);
});

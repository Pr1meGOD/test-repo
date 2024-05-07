import('node-fetch').then(async ({ default: fetch }) => {
    const express = require('express');
    const { JSDOM } = require('jsdom');

    const app = express();
    const port = 3000;

    // Middleware to enable CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', '*'); // Allow GET, POST, OPTIONS requests
        res.setHeader('Access-Control-Allow-Headers', '*'); // Allow Content-Type header
        next();
    });

    // API endpoint to fetch news headlines from BBC News
    app.get('/news', async (req, res) => {
        try {
            const response = await fetch('https://www.bbc.com/news');
            const html = await response.text();
            const dom = new JSDOM(html);
            const { document } = dom.window;

            const headlines = document.querySelectorAll('.gel-layout__item');
            const newsHeadlines = [];

            headlines.forEach(headline => {
                const titleElement = headline.querySelector('.gs-c-promo-heading__title');
                const linkElement = headline.querySelector('.gs-c-promo-heading__link');

                if (titleElement && linkElement) {
                    const title = titleElement.textContent.trim();
                    const link = linkElement.href;
                    newsHeadlines.push({ title, link });
                }
            });

            res.setHeader('Content-Type', 'application/json');
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



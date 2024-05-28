import('node-fetch').then(async ({ default: fetch }) => {
    const express = require('express');

    const app = express();
    const port = 3000;

    // Middleware to enable CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', '*'); // Allow all methods
        res.setHeader('Access-Control-Allow-Headers', '*'); // Allow all headers
        next();
    });

    // API endpoint to fetch news headlines from specified website
    app.get('/news', async (req, res) => {
        const website = req.query.website;

        if (!website) {
            return res.status(400).json({ error: 'Website is required' });
        }

        try {
            let apiUrl;
            const apiKey = 'e382cf0baf104c3ca084d880a340dfa9';

            // Define the API URL based on the provided website
            if (website === 'cnn-news') {
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${apiKey}`;
            } else if (website === 'bbc-news') {
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${apiKey}`;
            } else {
                return res.status(400).json({ error: 'Unsupported website' });
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                const articles = data.articles;
                const newsHeadlines = articles.map(article => ({
                    title: article.title,
                    link: article.url
                }));
                res.json(newsHeadlines);
            } else {
                throw new Error(`Failed to fetch news headlines from ${website}`);
            }
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


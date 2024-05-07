import('node-fetch').then(async ({ default: fetch }) => {
    const express = require('express');

    const app = express();
    const port = 3000;

    // Middleware to enable CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', '*'); // Allow only GET requests
        res.setHeader('Access-Control-Allow-Headers', '*'); // Allow only Content-Type header
        next();
    });

    // API endpoint to fetch news headlines from BBC
    app.get('/news', async (req, res) => {
        try {
            const apiKey = '8299ddae71074acd8232edcfef9b7fb8'; // Replace with your News API key
            const response = await fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`);
            const data = await response.json();

            if (data.status === 'ok') {
                const articles = data.articles;
                const newsHeadlines = articles.map(article => ({
                    title: article.title,
                    link: article.url
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
}).catch(error => {
    console.error('Error importing node-fetch:', error);
});

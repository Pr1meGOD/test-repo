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
            const cnnApiKey = 'e382cf0baf104c3ca084d880a340dfa9';
            const bbcApiKey = '8299ddae71074acd8232edcfef9b7fb8';
            const guardianApiKey = '4c73a5e6-93d1-4051-8e96-933b8d4fa06b';
            const nytimesApiKey = 'LMv5Elsw8GmMHGOhyr3MQTuSGHNWgxgu';

            // Define the API URL based on the provided website
            if (website === 'cnn-news') {
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${cnnApiKey}`;
            } else if (website === 'bbc-news') {
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${bbcApiKey}`;
            } else if (website === 'guardian-news') {
                apiUrl = `https://content.guardianapis.com/search?api-key=${guardianApiKey}`;
            } else if (website === 'nytimes-news') {
                apiUrl = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${nytimesApiKey}`;
            } else {
                return res.status(400).json({ error: 'Unsupported website' });
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if ((website === 'cnn-news' || website === 'bbc-news') && data.status === 'ok') {
                const articles = data.articles;
                const newsHeadlines = articles.map(article => ({
                    title: article.title,
                    link: article.url
                }));
                res.json(newsHeadlines);
            } else if (website === 'guardian-news' && data.response.status === 'ok') {
                const articles = data.response.results;
                const newsHeadlines = articles.map(article => ({
                    title: article.webTitle,
                    link: article.webUrl
                }));
                res.json(newsHeadlines);
            } else if (website === 'nytimes-news' && data.status === 'OK') {
                const articles = data.results;
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


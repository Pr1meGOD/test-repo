import('node-fetch').then(async ({ default: fetch }) => {
    const express = require('express');
    const { response } = require('express');

    const app = express();
    const port = 3000;

    // Middleware to enable CORS
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', '*'); // Allow GET, POST, OPTIONS requests
        res.setHeader('Access-Control-Allow-Headers', '*'); // Allow Content-Type header
        next();
    });

    // Function to fetch news from BBC
    async function fetchNewsFromBBC() {
        try {
            const apiKey = '8299ddae71074acd8232edcfef9b7fb8';
            const mainUrl = `https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`;
            const response = await fetch(mainUrl);
            const data = await response.json();
            const articles = data.articles || [];

            const results = articles.map(article => article.title);
            results.forEach((result, index) => {
                console.log(index + 1, result); // Print trending news to console
            });

            return results;
        } catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    }

    // API endpoint to fetch and speak news
    app.get('/speakNews', async (req, res) => {
        try {
            const newsResults = await fetchNewsFromBBC();
            if (newsResults.length > 0) {
                const newsText = newsResults.join('. ');
                const newsSpeech = new SpeechSynthesisUtterance(newsText);
                window.speechSynthesis.speak(newsSpeech); // Speak the news

                res.setHeader('Content-Type', 'application/json');
                res.json({ message: 'News spoken successfully.' });
            } else {
                res.status(404).json({ error: 'No news articles found.' });
            }
        } catch (error) {
            console.error('Error speaking news:', error);
            res.status(500).json({ error: 'Failed to speak news.' });
        }
    });

    app.listen(port, () => {
        console.log(`Backend server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Error importing node-fetch:', error);
});

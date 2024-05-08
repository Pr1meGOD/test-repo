import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', '*'); // Allow only GET requests
    res.setHeader('Access-Control-Allow-Headers', '*'); // Allow only Content-Type header
    next();
});

// API endpoint to fetch news headlines from BBC and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const apiKey = '8299ddae71074acd8232edcfef9b7fb8'; // Your News API key
        const response = await fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok') {
            const articles = data.articles;
            const newsHeadlines = articles.map(article => ({
                title: article.title,
                link: article.url,
                sentiment: getSentiment(article.title) // Call function to get sentiment
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

// Function to perform sentiment analysis (dummy function for demonstration)
function getSentiment(title) {
    // Perform sentiment analysis logic here
    // This is a placeholder function, you would replace it with your actual sentiment analysis logic
    const randomSentiment = Math.random() < 0.5 ? 'Positive' : 'Negative';
    return randomSentiment;
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});


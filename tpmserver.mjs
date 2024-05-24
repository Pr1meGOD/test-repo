import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from BBC and CNN and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const bbcApiKey = '8299ddae71074acd8232edcfef9b7fb8';
        const cnnApiKey = 'e382cf0baf104c3ca084d880a340dfa9';

        const [bbcResponse, cnnResponse] = await Promise.all([
            fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${bbcApiKey}`),
            fetch(`https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${cnnApiKey}`)
        ]);

        const [bbcData, cnnData] = await Promise.all([
            bbcResponse.json(),
            cnnResponse.json()
        ]);

        if (bbcData.status === 'ok' && cnnData.status === 'ok') {
            const bbcArticles = bbcData.articles;
            const cnnArticles = cnnData.articles;

            const allArticles = [...bbcArticles, ...cnnArticles];
            const newsHeadlines = await Promise.all(allArticles.map(async article => {
                const title = article.title;
                const link = article.url;
                const sentiment = await getSentiment(title);
                return { title, link, sentiment };
            }));
            res.json(newsHeadlines);
        } else {
            throw new Error('Failed to fetch news headlines from BBC or CNN');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis
async function getSentiment(title) {
    try {
        const sentimentAPI = 'https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev';
        const response = await axios.post(sentimentAPI, { text: title });
        const sentiment = response.data.sentiment;
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

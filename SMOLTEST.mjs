import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from Hindustan Times
app.get('/news', async (req, res) => {
    try {
        const response = await axios.get('https://www.hindustantimes.com');
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Select the top 10 headlines
        const headlines = [];
        $('div[data-hrpnl="latestnews"] h2 a').each((index, element) => {
            if (index < 10) {
                const title = $(element).text();
                const link = $(element).attr('href');
                headlines.push({ title, link });
            }
        });

        // Perform sentiment analysis on the headlines
        const newsHeadlines = await Promise.all(headlines.map(async ({ title, link }) => {
            const sentiment = await getSentiment(title);
            return { title, link, sentiment };
        }));

        res.json(newsHeadlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis
async function getSentiment(title) {
    try {
        const sentimentAPI = 'https://c6a7zwwwyj.execute-api.us-east-1.amazonaws.com/devv';
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

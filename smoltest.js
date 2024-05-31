import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

app.get('/news', async (req, res) => {
    try {
        const response = await axios.get('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml');
        const xml = response.data;

        parseString(xml, async (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to parse XML' });
            }

            const items = result.rss.channel[0].item;
            const headlines = await Promise.all(
                items.slice(0, 10).map(async item => {
                    const title = item.title[0];
                    const link = item.link[0];
                    const sentiment = await getSentiment(title);
                    return { title, link, sentiment };
                })
            );

            res.json(headlines);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

async function getSentiment(title) {
    try {
        const sentimentAPI = "https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev";
        const response = await axios.post(sentimentAPI, { text: title });
        const sentimentData = JSON.parse(response.data.body);
        return sentimentData.sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





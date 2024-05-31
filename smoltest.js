import express from 'express';
import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

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
        } else if (website === 'toi-news') {
            apiUrl = `https://timesofindia.indiatimes.com/rssfeedstopstories.cms`;
        } else if (website === 'hindustan-times') {
            const response = await fetch('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml');
            const xml = await response.text();
            const result = await parseString(xml);
            const items = result.rss.channel[0].item.slice(0, 10);
            const headlines = items.map(item => ({
                title: item.title[0],
                link: item.link[0]
            }));
            return res.json(headlines);
        } else {
            return res.status(400).json({ error: 'Unsupported website' });
        }

        const response = await fetch(apiUrl);

        let data;
        if (website === 'toi-news') {
            const xmlText = await response.text();
            parseString(xmlText, (err, result) => {
                if (err) throw err;
                data = result.rss.channel[0].item.slice(0, 10); // Limit to top 10 headlines
            });
        } else {
            data = await response.json();
        }

        let articles;
        if ((website === 'cnn-news' || website === 'bbc-news') && data.status === 'ok') {
            articles = data.articles.slice(0, 10);
        } else if (website === 'guardian-news' && data.response.status === 'ok') {
            articles = data.response.results.slice(0, 10);
        } else if (website === 'nytimes-news' && data.status === 'OK') {
            articles = data.results.slice(0, 10);
        } else if (website === 'toi-news' && data.length > 0) {
            articles = data.map(item => ({
                title: item.title[0],
                link: item.link[0]
            }));
        } else {
            throw new Error(`Failed to fetch news headlines from ${website}`);
        }

        const newsHeadlines = articles.map(article => ({
            title: website === 'guardian-news' ? article.webTitle : article.title,
            link: website === 'guardian-news' ? article.webUrl : article.url
        }));

        res.json(newsHeadlines);
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});





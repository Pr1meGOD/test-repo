import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

app.use(cors());

const cnnApiKey = 'e382cf0baf104c3ca084d880a340dfa9';
const bbcApiKey = '8299ddae71074acd8232edcfef9b7fb8';
const guardianApiKey = '4c73a5e6-93d1-4051-8e96-933b8d4fa06b';
const nytimesApiKey = 'LMv5Elsw8GmMHGOhyr3MQTuSGHNWgxgu';

app.get('/news', async (req, res) => {
    const website = req.query.website;

    if (!website) {
        return res.status(400).json({ error: 'Website is required' });
    }

    try {
        let apiUrl;

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
        } else if (website === 'ht-news') {
            apiUrl = `https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml`;
        } else {
            return res.status(400).json({ error: 'Unsupported website' });
        }

        let articles = [];

        if (website === 'ht-news') {
            const response = await axios.get(apiUrl);
            const xml = response.data;
            parseString(xml, async (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to parse XML' });
                }
                const items = result.rss.channel[0].item.slice(0, 10);
                articles = await Promise.all(
                    items.map(async item => {
                        const title = item.title[0];
                        const link = item.link[0];
                        const sentiment = await getSentiment(title);
                        return { title, link, sentiment };
                    })
                );
                res.json(articles);
            });
        } else {
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

            articles = await Promise.all(
                articles.map(async article => {
                    const title = website === 'guardian-news' ? article.webTitle : article.title;
                    const link = website === 'guardian-news' ? article.webUrl : article.url;
                    const sentiment = await getSentiment(title);
                    return { title, link, sentiment };
                })
            );

            res.json(articles);
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
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
    console.log(`Backend server running at http://localhost:${port}`);
});


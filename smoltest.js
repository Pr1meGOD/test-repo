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
        } else if (website === 'livemint-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4553266773c7d8f5c57a2944449b3041a19b2&q=https://www.livemint.com/`;
        } else if (website === 'ie-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_45625139de47ae7f0dedc29fd05a6dab95b0c&q=https://indianexpress.com/&language=en`;
        } else if (website === 'nbc-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4567897d90734c71bf518d4098e2d2345a31c&q=https://www.nbcnews.com/`;
        } else {
            return res.status(400).json({ error: 'Unsupported website' });
        }

        let articles = [];

        if (website === 'ht-news' || website === 'toi-news') {
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

                if (website === 'toi-news') {
                    articles = articles.map(article => ({
                        ...article,
                        link: `${article.link}`
                    }));
                }

                res.json(articles);
            });
        } else {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (website === 'cnn-news' || website === 'bbc-news') {
                articles = data.articles.slice(0, 10);
            } else if (website === 'guardian-news') {
                articles = data.response.results.slice(0, 10);
            } else if (website === 'nytimes-news') {
                articles = data.results.slice(0, 10);
            } else if (website === 'livemint-news' || website === 'ie-news' || website === 'nbc-news') {
                articles = data.results.slice(0, 10);
            }

            const results = await Promise.all(
                articles.map(async article => {
                    const title = article.title || article.webTitle;
                    const link = article.url || article.webUrl;
                    const sentiment = await getSentiment(title);
                    return { title, link, sentiment };
                })
            );

            res.json(results);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

async function getSentiment(text) {
    try {
        const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
        const response = await axios.post(
            apiUrl,
            {
                prompt: `Analyze the sentiment of the following text:\n\n"${text}"\n\nSentiment:`,
                max_tokens: 10
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer YOUR_OPENAI_API_KEY`
                }
            }
        );
        const sentiment = response.data.choices[0].text.trim();
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'Unknown';
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

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
const newsdataApiKey = 'pub_45625139de47ae7f0dedc29fd05a6dab95b0c'; // Use your actual API key here

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
            apiUrl = `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=https://www.livemint.com/&language=en`;
        } else if (website === 'ie-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=https://indianexpress.com/&language=en`;
        } else if (website === 'nbc-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4567897d90734c71bf518d4098e2d2345a31c&q=https://www.nbcnews.com/`;
        } else if (website === 'thehindu-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=https://www.thehindu.com/`;
        } else if (website === 'zee-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_45702963c65c4021894ccf1858d05f001f0e0&q=https://zeenews.india.com/&language=en`;
        } else if (website === 'wp-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_45702963c65c4021894ccf1858d05f001f0e0&q=https://www.washingtonpost.com/&language=en`;
        } else if (website === 'forbes-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4568352b5e63671c676e20c29210bf5a47d71&q=https://www.forbes.com/&language=en`;
        } else if (website === 'fox-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4567897d90734c71bf518d4098e2d2345a31c&q=https://www.foxnews.com/&language=en`;
        } else if (website === 'news18-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4553266773c7d8f5c57a2944449b3041a19b2&q=https://www.news18.com/&language=en`;
        } else if (website === 'time-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4553266773c7d8f5c57a2944449b3041a19b2&q=https://time.com/`;
        } else if (website === 'vox-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4553266773c7d8f5c57a2944449b3041a19b2&q=https://www.vox.com/&language=en`;
        } else if (website === 'indiatoday-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4568352b5e63671c676e20c29210bf5a47d71&q=https://www.indiatoday.in/&language=en`;
        } else if (website === 'dc-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=https://www.deccanchronicle.com/&language=en`;
        } else if (website === 'ndtv-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4553266773c7d8f5c57a2944449b3041a19b2&q=https://www.ndtv.com/`;
        } else if (website === 'huffpost-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4567897d90734c71bf518d4098e2d2345a31c&q=https://www.huffpost.com/`;
        } else if (website === 'dna-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_45702963c65c4021894ccf1858d05f001f0e0&q=https://www.dnaindia.com/&language=en`;
        } else if (website === 'abp-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_46055dd31b8f4667dc66d976f583b226b4150&q=https://news.abplive.com/`;
        } else if (website === 'newsweek-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_46055dd31b8f4667dc66d976f583b226b4150&q=https://www.newsweek.com/&language=en`;
        } else if (website === 'firstpost-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_4567897d90734c71bf518d4098e2d2345a31c&q=https://www.firstpost.com/ `;
        } else if (website === 'bi-news') {
            apiUrl = `https://newsdata.io/api/1/news?apikey=pub_46055dd31b8f4667dc66d976f583b226b4150&q=https://www.businessinsider.in&language=en `;
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

            if ((website === 'cnn-news' || website === 'bbc-news') && data.status === 'ok') {
                articles = data.articles.slice(0, 10);
            } else if (website === 'guardian-news' && data.response.status === 'ok') {
                articles = data.response.results.slice(0, 10);
            } else if (website === 'nytimes-news' && data.status === 'OK') {
                articles = data.results.slice(0, 10);
            } else if (website === 'livemint-news' || website === 'ie-news' || website === 'nbc-news' || website === 'thehindu-news' || website === 'zee-news' || website === 'wp-news' || website === 'forbes-news' || website === 'fox-news' || website === 'news18-news' || website === 'time-news' || website === 'vox-news' || website === 'indiatoday-news' || website === 'dc-news' || website === 'ndtv-news' || website === 'huffpost-news' || website === 'dna-news' || website === 'abp-news' || website === 'newsweek-news' || website === 'firstpost-news' || website === 'bi-news') {
                articles = data.results.slice(0, 10);
            } else {
                throw new Error(`Failed to fetch news headlines from ${website}`);
            }

            articles = await Promise.all(
                articles.map(async article => {
                    let title, link;
                    if (website === 'guardian-news') {
                        title = article.webTitle;
                        link = article.webUrl;
                    } else if (website === 'livemint-news' || website === 'ie-news' || website === 'nbc-news' || website === 'thehindu-news' || website === 'zee-news' || website === 'wp-news' || website === 'forbes-news' || website === 'fox-news' || website === 'news18-news' || website === 'time-news' || website === 'vox-news' || website === 'indiatoday-news' || website === 'dc-news' || website === 'ndtv-news' || website === 'huffpost-news' || website === 'dna-news' || website === 'abp-news' || website === 'newsweek-news' || website === 'firstpost-news' || website === 'bi-news') {
                        title = article.title;
                        link = `${article.link}`;
                    } else {
                        title = article.title;
                        link = article.url;
                    }
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
import express from 'express';
import axios from 'axios';
import { parseString } from 'xml2js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

// Function to fetch sentiment analysis
async function getSentiment(title) {
    try {
        const sentimentAPI = "https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev";
        const response = await axios.post(sentimentAPI, { text: title });
        const sentimentData = response.data; // Assuming sentiment API returns data directly
        return sentimentData.sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A'; // Default value in case of error
    }
}

// Route for fetching news
app.get('/news', async (req, res) => {
    try {
        const website = req.query.website;

        if (!website) {
            return res.status(400).json({ error: 'Website is required' });
        }

        let apiUrl;
        let articles;

        // Define API URLs and keys for different websites
        const cnnApiKey = 'e382cf0baf104c3ca084d880a340dfa9';
        const bbcApiKey = '8299ddae71074acd8232edcfef9b7fb8';
        const guardianApiKey = '4c73a5e6-93d1-4051-8e96-933b8d4fa06b';
        const nytimesApiKey = 'LMv5Elsw8GmMHGOhyr3MQTuSGHNWgxgu';

        // Fetch news based on website query parameter
        switch (website) {
            case 'cnn-news':
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${cnnApiKey}`;
                break;
            case 'bbc-news':
                apiUrl = `https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=${bbcApiKey}`;
                break;
            case 'guardian-news':
                apiUrl = `https://content.guardianapis.com/search?api-key=${guardianApiKey}`;
                break;
            case 'nytimes-news':
                apiUrl = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${nytimesApiKey}`;
                break;
            case 'toi-news':
                apiUrl = `https://timesofindia.indiatimes.com/rssfeedstopstories.cms`;
                break;
            case 'hindustan-times':
                // Handle Hindustan Times separately (already implemented)
                // Example:
                const response = await axios.get('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml');
                const xml = response.data;
                parseString(xml, async (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to parse XML' });
                    }
                    const items = result.rss.channel[0].item;
                    articles = await Promise.all(
                        items.slice(0, 10).map(async item => {
                            const title = item.title[0];
                            const link = item.link[0];
                            const sentiment = await getSentiment(title);
                            return { title, link, sentiment };
                        })
                    );
                    res.json(articles);
                });
                return; // Return here to prevent further execution
            default:
                return res.status(400).json({ error: 'Unsupported website' });
        }

        // Fetch news from API URL
        const response = await axios.get(apiUrl);
        let data;

        if (website === 'toi-news') {
            const xmlText = response.data;
            parseString(xmlText, (err, result) => {
                if (err) throw err;
                data = result.rss.channel[0].item.slice(0, 10);
            });
        } else {
            data = response.data;
        }

        // Process fetched news data
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

        // Fetch sentiment for each article title
        articles = await Promise.all(
            articles.map(async article => ({
                ...article,
                sentiment: await getSentiment(article.title)
            }))
        );

        res.json(articles);
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});







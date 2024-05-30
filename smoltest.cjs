const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/news', async (req, res) => {
    try {
        const response = await axios.get('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml');
        const xml = response.data;
        
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to parse XML' });
            }

            const items = result.rss.channel[0].item;
            const headlines = items.slice(0, 10).map(item => ({
                title: item.title[0],
                link: item.link[0],
            }));

            res.json(headlines);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});












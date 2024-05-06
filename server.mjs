const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/headlines', async (req, res) => {
    try {
        const response = await fetch('https://www.bbc.com/news');
        if (!response.ok) {
            throw new Error('Failed to fetch news from BBC News');
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const headlines = [];
        $('h3').each((index, element) => {
            const headline = $(element).text().trim();
            if (headline) {
                headlines.push(headline);
            }
        });

        if (headlines.length === 0) {
            throw new Error('No headlines found');
        }

        res.json({ headlines });
    } catch (error) {
        console.error('Error fetching headlines:', error);
        res.status(500).json({ error: 'Error fetching headlines' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio'; // Import Cheerio

const app = express();
const PORT = process.env.PORT || 3000;

// Route to fetch headlines from BBC News and serve them to the frontend
app.get('/api/headlines', async (req, res) => {
    try {
        const response = await fetch('https://www.bbc.co.uk/news');
        if (!response.ok) {
            throw new Error('Failed to fetch news from BBC News');
        }

        const html = await response.text();

        // Parse HTML using Cheerio
        const $ = cheerio.load(html);

        // Extract headlines from the specific HTML structure
        const headlines = [];
        $('h3').each((index, element) => { // Change selector to 'h3'
            const headline = $(element).text().trim();
            if (headline) {
                headlines.push(headline);
            }
        });

        if (headlines.length === 0) {
            throw new Error('No headlines found'); // Throw error if no headlines are extracted
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

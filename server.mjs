import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Route to fetch news from BBC News and serve it to the frontend
app.get('/api/news', async (req, res) => {
    try {
        const response = await fetch('https://www.bbc.co.uk/news');
        const html = await response.text();
        res.send(html);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).send('Error fetching news');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import fetch from 'node-fetch';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/hindustantimes/news', async (req, res) => {
    try {
        const response = await fetch('https://www.hindustantimes.com/india-news');
        const html = await response.text();
        res.send(html);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

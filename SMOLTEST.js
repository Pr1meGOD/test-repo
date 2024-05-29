import("node-fetch")
    .then(async ({ default: fetch }) => {
        const express = require("express");
        const axios = require("axios");
        const parseString = require('xml2js').parseString;

        const app = express();
        const port = 3000;

        // Middleware to enable CORS
        app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "*");
            res.setHeader("Access-Control-Allow-Headers", "*");
            next();
        });

        // API endpoint to fetch news headlines from Times of India RSS and perform sentiment analysis
        app.get("/toi-news", async (req, res) => {
            try {
                const response = await fetch("https://timesofindia.indiatimes.com/rssfeedstopstories.cms");
                const xmlData = await response.text();

                // Parse XML to JSON
                parseString(xmlData, (err, result) => {
                    if (err) {
                        throw new Error("Failed to parse XML data");
                    }
                    const items = result.rss.channel[0].item;
                    const newsHeadlines = items.map(async (item) => {
                        const title = item.title[0];
                        const link = item.link[0];
                        const sentiment = await getSentiment(title);
                        return { title, link, sentiment };
                    });

                    Promise.all(newsHeadlines)
                        .then((headlines) => {
                            res.json(headlines.slice(0, 10)); // Limit to top 10 headlines
                        })
                        .catch((error) => {
                            throw new Error("Failed to fetch news headlines");
                        });
                });
            } catch (error) {
                console.error("Error fetching news headlines:", error);
                res.status(500).json({
                    error: "Failed to fetch news headlines",
                });
            }
        });

        // Function to perform sentiment analysis
        async function getSentiment(title) {
            try {
                const sentimentAPI = "https://xhkc56io19.execute-api.us-east-1.amazonaws.com/dev";
                const response = await axios.post(sentimentAPI, {
                    text: title,
                });
                const sentiment = response.data.sentiment;
                return sentiment;
            } catch (error) {
                console.error("Error fetching sentiment:", error);
                return "N/A";
            }
        }

        app.listen(port, () => {
            console.log(`Backend server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error importing node-fetch:", error);
    });


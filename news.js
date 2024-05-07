// Function to fetch news headlines from Hindustan Times
async function fetchNewsHeadlines() {
    const response = await fetch('https://www.hindustantimes.com/rss/topnews/rssfeed.xml');
    const data = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data, 'application/xml');
    const items = xml.querySelectorAll('item');
    
    const newsList = document.getElementById('newsList');
    
    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = title;
        a.href = link;
        li.appendChild(a);
        newsList.appendChild(li);
    });
}

// Fetch news headlines when the page loads
document.addEventListener('DOMContentLoaded', fetchNewsHeadlines);

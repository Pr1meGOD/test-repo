async function fetchNewsHeadlinesFromServer() {
    try {
        const response = await fetch('http://localhost:3000/news'); // Assuming your backend server is running on localhost:3000
        if (!response.ok) {
            throw new Error('Failed to fetch news headlines from server');
        }
        const data = await response.json();
        
        const newsList = document.getElementById('newsList');
        newsList.innerHTML = ''; // Clear previous list items
        
        data.forEach(item => {
            const title = item.title;
            const link = item.link;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = title;
            a.href = link;
            li.appendChild(a);
            newsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching news headlines from server:', error);
    }
}

// Fetch news headlines from backend server when the page loads
document.addEventListener('DOMContentLoaded', fetchNewsHeadlinesFromServer);

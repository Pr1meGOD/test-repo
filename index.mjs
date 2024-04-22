import AWS from 'aws-sdk';

const comprehend = new AWS.Comprehend({ region: 'us-east-1' });

export const handler = async (event, context) => {
    const text = event.text;
    const sentimentResult = await detectSentiment(text);
    
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': '*',  // Allow any headers
            'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({ sentiment: sentimentResult })
    };
    
    return response;
};

async function detectSentiment(text) {
    try {
        const data = await comprehend.detectSentiment({
            Text: text,
            LanguageCode: 'en'
        }).promise();
        
        return data.Sentiment;
    } catch (error) {
        console.error('Error detecting sentiment:', error);
        throw new Error('Error detecting sentiment.');
    }
}

// Add event listener to the Analyze button
document.querySelector('button').addEventListener('click', async () => {
    const textareaValue = document.querySelector('textarea').value;

    try {
        const response = await fetch('https://fy7ike3m1h.execute-api.us-east-1.amazonaws.com/ffff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': '*',  
                'Access-Control-Allow-Methods': 'POST'
            },
            body: JSON.stringify({ text: textareaValue })
        });

        const result = await response.json();

        // Update the headingdiv with the sentiment result
        document.getElementById('headingdiv').innerHTML = `<h3>Sentiment is: ${result.sentiment}</h3>`;
    } catch (error) {
        console.error('Error sending API request:', error);
    }
});

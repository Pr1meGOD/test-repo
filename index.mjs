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
